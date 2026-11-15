// Standalone Node.js server for Qubrix OS
// Runs without Cloudflare / Wrangler. Works on VPS, cPanel Node.js App (Passenger), or local development.
// Run: node server.js

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = process.env.PORT || 8787;
const PUBLIC_DIR = path.join(__dirname, "public");
const DB_DIR = path.join(__dirname, "db");
const DB_PATH = path.join(DB_DIR, "qubrix.sqlite");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "qubrix-admin-dev-pass-1234";

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Initialize SQLite driver (node:sqlite built-in, or better-sqlite3)
let db;
try {
  const { DatabaseSync } = require("node:sqlite");
  const rawDb = new DatabaseSync(DB_PATH);
  db = {
    prepare(sql) {
      const stmt = rawDb.prepare(sql);
      return {
        run(...args) { return stmt.run(...args); },
        get(...args) { return stmt.get(...args); },
        all(...args) { return stmt.all(...args); }
      };
    },
    exec(sql) { rawDb.exec(sql); }
  };
} catch (e) {
  try {
    const BetterSqlite3 = require("better-sqlite3");
    const rawDb = new BetterSqlite3(DB_PATH);
    db = {
      prepare(sql) {
        const stmt = rawDb.prepare(sql);
        return {
          run(...args) { return stmt.run(...args); },
          get(...args) { return stmt.get(...args); },
          all(...args) { return stmt.all(...args); }
        };
      },
      exec(sql) { rawDb.exec(sql); }
    };
  } catch (err) {
    console.error("FATAL: No SQLite driver available. Ensure Node 22+ or install better-sqlite3.");
    process.exit(1);
  }
}

// Ensure schema
const schemaFile = path.join(__dirname, "schema.sql");
if (fs.existsSync(schemaFile)) {
  db.exec(fs.readFileSync(schemaFile, "utf8"));
}

// Auto seed if tasks empty
const taskCount = db.prepare("SELECT COUNT(*) AS c FROM records WHERE resource = 'tasks'").get()?.c || 0;
const seedFile = path.join(__dirname, "seed.sql");
if (taskCount === 0 && fs.existsSync(seedFile)) {
  try {
    db.exec(fs.readFileSync(seedFile, "utf8"));
    console.log("Seeded starter data from seed.sql");
  } catch (err) {
    console.warn("Seed warning:", err.message);
  }
}

function getDefaultSettings() {
  return {
    startDate: new Date().toISOString().slice(0, 10),
    incorporationDate: "",
    targetCars: 40,
    googleRating: 0,
    googleReviews: 0,
    whatsapp: "",
    tech: 0, outlet: 0, chemicals: 0, legal: 0, contingency: 0
  };
}

function getExpenseApprover(amount, head) {
  const amt = Number(amount) || 0;
  if (amt > 100000) return "Board";
  if (head === "contingency" || amt > 25000) return "CEO";
  if (amt > 5000) {
    if (head === "tech") return "CTO";
    if (head === "legal") return "CEO";
    return "COO";
  }
  if (head === "tech") return "CTO";
  if (head === "legal") return "CEO";
  return "Outlet Mgr";
}

function sha256(val) {
  return crypto.createHash("sha256").update(String(val)).digest("hex");
}

function parseCookie(req) {
  const header = req.headers.cookie || "";
  const match = header.split(";").map(x => x.trim()).find(x => x.startsWith("qbx_session="));
  return match ? decodeURIComponent(match.slice("qbx_session=".length)) : "";
}

function isAdmin(req) {
  const token = parseCookie(req);
  if (!token) return false;
  const hash = sha256(token);
  const row = db.prepare("SELECT token_hash FROM sessions WHERE token_hash = ? AND expires_at > ?").get(hash, Date.now());
  return !!row;
}

function publicRecord(resource, item) {
  const copy = { ...item };
  if (resource === "logs") {
    copy.cash = 0; copy.upi = 0; copy.chemicalCost = 0;
  }
  if (resource === "expenses") {
    copy.description = "Private expense record";
    copy.amount = 0;
    copy.requestedBy = "Private";
    copy.approver = "Private";
  }
  return copy;
}

function listRecords(resource) {
  const rows = db.prepare("SELECT id, data FROM records WHERE resource = ? ORDER BY created_at DESC").all(resource);
  return rows.map(r => {
    try { return { id: r.id, ...JSON.parse(r.data) }; } catch { return { id: r.id }; }
  });
}

function saveRecord(resource, record, recordId) {
  const rid = recordId || record.id || crypto.randomUUID();
  const current = db.prepare("SELECT data FROM records WHERE resource = ? AND id = ?").get(resource, rid);
  const existing = current ? JSON.parse(current.data) : {};
  const merged = { ...existing, ...record, id: rid };

  if (resource === "expenses") {
    if (!merged.status) merged.status = "pending";
    if (!merged.approver) merged.approver = getExpenseApprover(merged.amount, merged.head);
  }

  const now = Date.now();
  db.prepare(`
    INSERT INTO records (resource, id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(resource, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(resource, rid, JSON.stringify(merged), now, now);
  return merged;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 200000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function sendJson(res, data, status = 200, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(JSON.stringify(data));
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const method = req.method.toUpperCase();

    // API Routing
    if (pathname.startsWith("/api")) {
      if (pathname === "/api/health" && method === "GET") {
        return sendJson(res, { ok: true, service: "qubrix-api" });
      }

      if (pathname === "/api/admin/login" && method === "POST") {
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
        const ipHash = sha256(ip);
        const since = Date.now() - 15 * 60 * 1000;
        const attempts = db.prepare("SELECT COUNT(*) AS n FROM auth_attempts WHERE ip_hash = ? AND created_at > ?").get(ipHash, since)?.n || 0;
        if (attempts >= 5) {
          return sendJson(res, { error: "Too many login attempts. Try again in 15 minutes." }, 429);
        }

        const body = await readBody(req);
        if (String(body.password || "") !== ADMIN_PASSWORD) {
          db.prepare("INSERT INTO auth_attempts (ip_hash, created_at) VALUES (?, ?)").run(ipHash, Date.now());
          return sendJson(res, { error: "Incorrect administrator password." }, 401);
        }

        db.prepare("DELETE FROM auth_attempts WHERE ip_hash = ?").run(ipHash);
        db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());

        const token = crypto.randomUUID() + crypto.randomUUID();
        const expires = Date.now() + 12 * 60 * 60 * 1000;
        db.prepare("INSERT INTO sessions (token_hash, expires_at, created_at) VALUES (?, ?, ?)").run(sha256(token), expires, Date.now());

        const isHttps = req.headers["x-forwarded-proto"] === "https";
        const cookie = `qbx_session=${encodeURIComponent(token)}; HttpOnly; ${isHttps ? "Secure; " : ""}SameSite=Strict; Path=/; Max-Age=43200`;
        return sendJson(res, { ok: true, expiresAt: expires }, 200, { "Set-Cookie": cookie });
      }

      if (pathname === "/api/admin/session" && method === "GET") {
        return sendJson(res, { authenticated: isAdmin(req) });
      }

      if (pathname === "/api/admin/logout" && method === "POST") {
        const token = parseCookie(req);
        if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
        return sendJson(res, { ok: true }, 200, { "Set-Cookie": "qbx_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
      }

      const admin = isAdmin(req);

      if (pathname.startsWith("/api/export/")) {
        const resource = pathname.split("/").pop();
        const exportKeys = {
          logs: ["date","cars","cash","upi","chemicalCost","waitMinutes","complaints","newCustomers","repeatCustomers"],
          expenses: ["date","head","description","amount","requestedBy","approver","status"],
          tasks: ["title","phase","owner","dueDay","status"],
          audits: ["date","sopCode","score","auditor"],
          compliance: ["title","form","owner","fixedDate","note","status"]
        };
        if (!exportKeys[resource]) return sendJson(res, { error: "Not found" }, 404);
        const rows = listRecords(resource);
        const safeRows = admin ? rows : rows.map(r => publicRecord(resource, r));
        const esc = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
        const lines = [exportKeys[resource].map(esc).join(",")];
        for (const row of safeRows) lines.push(exportKeys[resource].map(k => esc(row[k])).join(","));

        res.writeHead(200, {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="qubrix-${resource}.csv"`,
          "Cache-Control": "no-store"
        });
        return res.end(lines.join("\r\n"));
      }

      if (pathname === "/api/settings") {
        if (method === "GET") {
          const rows = db.prepare("SELECT key, value FROM settings").all();
          const settings = getDefaultSettings();
          for (const r of rows) {
            try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
          }
          if (!admin) {
            settings.whatsapp = "";
            for (const k of ["tech","outlet","chemicals","legal","contingency"]) settings[k] = 0;
          }
          return sendJson(res, settings);
        }
        if (method === "PATCH") {
          if (!admin) return sendJson(res, { error: "Administrator login required." }, 401);
          const body = await readBody(req);
          const allowed = new Set(Object.keys(getDefaultSettings()));
          for (const [k, v] of Object.entries(body)) {
            if (allowed.has(k)) {
              db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
                .run(k, JSON.stringify(v));
            }
          }
          const rows = db.prepare("SELECT key, value FROM settings").all();
          const settings = getDefaultSettings();
          for (const r of rows) {
            try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
          }
          return sendJson(res, settings);
        }
        return sendJson(res, { error: "Method not allowed" }, 405);
      }

      const match = pathname.match(/^\/api\/(tasks|compliance|logs|expenses|audits)(?:\/([^/]+))?$/);
      if (match) {
        const resource = match[1];
        const recordId = match[2];

        if (method === "GET" && !recordId) {
          const rows = listRecords(resource);
          return sendJson(res, admin ? rows : rows.map(r => publicRecord(resource, r)));
        }

        if (!admin) return sendJson(res, { error: "Administrator login required. Use the Admin login button." }, 401);

        if (method === "POST" && !recordId) {
          const body = await readBody(req);
          return sendJson(res, saveRecord(resource, body), 201);
        }

        if (method === "PATCH" && recordId) {
          const body = await readBody(req);
          const exists = db.prepare("SELECT id FROM records WHERE resource = ? AND id = ?").get(resource, recordId);
          if (!exists) return sendJson(res, { error: "Record not found" }, 404);
          return sendJson(res, saveRecord(resource, body, recordId));
        }

        if (method === "DELETE" && recordId) {
          db.prepare("DELETE FROM records WHERE resource = ? AND id = ?").run(resource, recordId);
          return sendJson(res, { ok: true });
        }

        return sendJson(res, { error: "Method not allowed" }, 405);
      }

      return sendJson(res, { error: "API route not found" }, 404);
    }

    // Static Asset Serving (public directory)
    let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // Fallback for SPA routing
      filePath = path.join(PUBLIC_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Server error:", err);
    sendJson(res, { error: "Internal server error" }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Qubrix server listening on http://localhost:${PORT}`);
});
