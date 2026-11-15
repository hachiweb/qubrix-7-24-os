<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbPath = __DIR__ . '/../db/qubrix.sqlite';
$dbDir = dirname($dbPath);
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Initialize schema if tables missing
$db->exec("
CREATE TABLE IF NOT EXISTS records (
  resource TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (resource, id)
);
CREATE INDEX IF NOT EXISTS idx_records_resource_created ON records(resource, created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_time ON auth_attempts(ip_hash, created_at);
");

// Admin password: from environment variable or default
$adminPassword = getenv('ADMIN_PASSWORD') ?: 'qubrix-admin-dev-pass-1234';

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function getSessionToken(): string {
    return $_COOKIE['qbx_session'] ?? '';
}

function isAdmin(PDO $db): bool {
    $token = getSessionToken();
    if (!$token) return false;
    $hash = hash('sha256', $token);
    $stmt = $db->prepare("SELECT token_hash FROM sessions WHERE token_hash = ? AND expires_at > ?");
    $stmt->execute([$hash, (int)(microtime(true) * 1000)]);
    return (bool)$stmt->fetch();
}

function getDefaultSettings(): array {
    return [
        'startDate' => date('Y-m-d'),
        'incorporationDate' => '',
        'targetCars' => 40,
        'googleRating' => 0,
        'googleReviews' => 0,
        'whatsapp' => '',
        'tech' => 0, 'outlet' => 0, 'chemicals' => 0, 'legal' => 0, 'contingency' => 0
    ];
}

function getExpenseApprover(float $amount, string $head): string {
    if ($amount > 100000) return 'Board';
    if ($head === 'contingency' || $amount > 25000) return 'CEO';
    if ($amount > 5000) {
        if ($head === 'tech') return 'CTO';
        if ($head === 'legal') return 'CEO';
        return 'COO';
    }
    if ($head === 'tech') return 'CTO';
    if ($head === 'legal') return 'CEO';
    return 'Outlet Mgr';
}

function publicRecord(string $resource, array $item): array {
    $copy = $item;
    if ($resource === 'logs') {
        $copy['cash'] = 0;
        $copy['upi'] = 0;
        $copy['chemicalCost'] = 0;
    }
    if ($resource === 'expenses') {
        $copy['description'] = 'Private expense record';
        $copy['amount'] = 0;
        $copy['requestedBy'] = 'Private';
        $copy['approver'] = 'Private';
    }
    return $copy;
}

function listRecords(PDO $db, string $resource): array {
    $stmt = $db->prepare("SELECT id, data FROM records WHERE resource = ? ORDER BY created_at DESC");
    $stmt->execute([$resource]);
    $results = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data = json_decode($row['data'], true) ?: [];
        $data['id'] = $row['id'];
        $results[] = $data;
    }
    return $results;
}

function saveRecord(PDO $db, string $resource, array $record, ?string $recordId = null): array {
    $rid = $recordId ?: ($record['id'] ?? bin2hex(random_bytes(16)));
    $stmt = $db->prepare("SELECT data FROM records WHERE resource = ? AND id = ?");
    $stmt->execute([$resource, $rid]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    $merged = array_merge($existing ? (json_decode($existing['data'], true) ?: []) : [], $record, ['id' => $rid]);

    if ($resource === 'expenses') {
        if (empty($merged['status'])) $merged['status'] = 'pending';
        if (empty($merged['approver'])) {
            $merged['approver'] = getExpenseApprover((float)($merged['amount'] ?? 0), (string)($merged['head'] ?? ''));
        }
    }

    $now = (int)(microtime(true) * 1000);
    $stmt = $db->prepare("
        INSERT INTO records (resource, id, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(resource, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    ");
    $stmt->execute([$resource, $rid, json_encode($merged), $now, $now]);
    return $merged;
}

// Request path parsing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize /api/...
$path = preg_replace('#^/api#', '', $uri);
$path = '/' . trim($path, '/');
$method = strtoupper($_SERVER['REQUEST_METHOD']);

// Route: /health
if ($path === '/health' && $method === 'GET') {
    jsonResponse(['ok' => true, 'service' => 'qubrix-api']);
}

// Route: /admin/login
if ($path === '/admin/login' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ipHash = hash('sha256', $ip);
    $now = (int)(microtime(true) * 1000);
    $since = $now - (15 * 60 * 1000);

    $stmt = $db->prepare("SELECT COUNT(*) AS n FROM auth_attempts WHERE ip_hash = ? AND created_at > ?");
    $stmt->execute([$ipHash, $since]);
    $attempts = (int)$stmt->fetchColumn();

    if ($attempts >= 5) {
        jsonResponse(['error' => 'Too many login attempts. Try again in 15 minutes.'], 429);
    }

    $password = (string)($body['password'] ?? '');
    if (!hash_equals($adminPassword, $password)) {
        $stmt = $db->prepare("INSERT INTO auth_attempts (ip_hash, created_at) VALUES (?, ?)");
        $stmt->execute([$ipHash, $now]);
        jsonResponse(['error' => 'Incorrect administrator password.'], 401);
    }

    $db->prepare("DELETE FROM auth_attempts WHERE ip_hash = ?")->execute([$ipHash]);
    // Cleanup expired
    $db->prepare("DELETE FROM sessions WHERE expires_at <= ?")->execute([$now]);

    $token = bin2hex(random_bytes(32));
    $expires = $now + (12 * 60 * 60 * 1000);
    $stmt = $db->prepare("INSERT INTO sessions (token_hash, expires_at, created_at) VALUES (?, ?, ?)");
    $stmt->execute([hash('sha256', $token), $expires, $now]);

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? 80) == 443;
    setcookie('qbx_session', $token, [
        'expires' => time() + 43200,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    jsonResponse(['ok' => true, 'expiresAt' => $expires]);
}

// Route: /admin/session
if ($path === '/admin/session' && $method === 'GET') {
    jsonResponse(['authenticated' => isAdmin($db)]);
}

// Route: /admin/logout
if ($path === '/admin/logout' && $method === 'POST') {
    $token = getSessionToken();
    if ($token) {
        $db->prepare("DELETE FROM sessions WHERE token_hash = ?")->execute([hash('sha256', $token)]);
    }
    setcookie('qbx_session', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    jsonResponse(['ok' => true]);
}

// Route: /export/:resource
if (str_starts_with($path, '/export/')) {
    $resource = basename($path);
    $exportKeys = [
        'logs' => ['date','cars','cash','upi','chemicalCost','waitMinutes','complaints','newCustomers','repeatCustomers'],
        'expenses' => ['date','head','description','amount','requestedBy','approver','status'],
        'tasks' => ['title','phase','owner','dueDay','status'],
        'audits' => ['date','sopCode','score','auditor'],
        'compliance' => ['title','form','owner','fixedDate','note','status']
    ];
    if (!isset($exportKeys[$resource])) {
        jsonResponse(['error' => 'Not found'], 404);
    }
    $admin = isAdmin($db);
    $rows = listRecords($db, $resource);
    $safeRows = $admin ? $rows : array_map(fn($x) => publicRecord($resource, $x), $rows);

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="qubrix-' . $resource . '.csv"');
    header('Cache-Control: no-store');

    $out = fopen('php://output', 'w');
    fputcsv($out, $exportKeys[$resource]);
    foreach ($safeRows as $row) {
        $line = [];
        foreach ($exportKeys[$resource] as $k) {
            $line[] = $row[$k] ?? '';
        }
        fputcsv($out, $line);
    }
    fclose($out);
    exit;
}

// Route: /settings
if ($path === '/settings') {
    $admin = isAdmin($db);
    if ($method === 'GET') {
        $stmt = $db->query("SELECT key, value FROM settings");
        $settings = getDefaultSettings();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $val = json_decode($row['value'], true);
            $settings[$row['key']] = ($val !== null) ? $val : $row['value'];
        }
        if (!$admin) {
            $settings['whatsapp'] = '';
            foreach (['tech','outlet','chemicals','legal','contingency'] as $k) {
                $settings[$k] = 0;
            }
        }
        jsonResponse($settings);
    }
    if ($method === 'PATCH') {
        if (!$admin) jsonResponse(['error' => 'Administrator login required.'], 401);
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $allowed = array_keys(getDefaultSettings());
        $stmt = $db->prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
        foreach ($body as $k => $v) {
            if (in_array($k, $allowed, true)) {
                $stmt->execute([$k, json_encode($v)]);
            }
        }
        $stmt = $db->query("SELECT key, value FROM settings");
        $settings = getDefaultSettings();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $val = json_decode($row['value'], true);
            $settings[$row['key']] = ($val !== null) ? $val : $row['value'];
        }
        jsonResponse($settings);
    }
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Resource routes: /tasks, /compliance, /logs, /expenses, /audits
if (preg_match('#^/(tasks|compliance|logs|expenses|audits)(?:/([^/]+))?$#', $path, $m)) {
    $resource = $m[1];
    $recordId = $m[2] ?? null;
    $admin = isAdmin($db);

    if ($method === 'GET' && !$recordId) {
        $rows = listRecords($db, $resource);
        $safeRows = $admin ? $rows : array_map(fn($x) => publicRecord($resource, $x), $rows);
        jsonResponse($safeRows);
    }

    if (!$admin) {
        jsonResponse(['error' => 'Administrator login required. Use the Admin login button.'], 401);
    }

    if ($method === 'POST' && !$recordId) {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) jsonResponse(['error' => 'Invalid JSON object'], 400);
        jsonResponse(saveRecord($db, $resource, $body), 201);
    }

    if ($method === 'PATCH' && $recordId) {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $db->prepare("SELECT id FROM records WHERE resource = ? AND id = ?");
        $stmt->execute([$resource, $recordId]);
        if (!$stmt->fetch()) jsonResponse(['error' => 'Record not found'], 404);
        jsonResponse(saveRecord($db, $resource, $body, $recordId));
    }

    if ($method === 'DELETE' && $recordId) {
        $stmt = $db->prepare("DELETE FROM records WHERE resource = ? AND id = ?");
        $stmt->execute([$resource, $recordId]);
        jsonResponse(['ok' => true]);
    }

    jsonResponse(['error' => 'Method not allowed'], 405);
}

jsonResponse(['error' => 'API route not found'], 404);
