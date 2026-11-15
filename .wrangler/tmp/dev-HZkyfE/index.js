var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.js
var JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
var RESOURCES = /* @__PURE__ */ new Set(["tasks", "compliance", "logs", "expenses", "audits"]);
function getDefaultSettings() {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return {
    startDate: today,
    incorporationDate: "",
    targetCars: 40,
    googleRating: 0,
    googleReviews: 0,
    whatsapp: "",
    tech: 0,
    outlet: 0,
    chemicals: 0,
    legal: 0,
    contingency: 0
  };
}
__name(getDefaultSettings, "getDefaultSettings");
function getExpenseApprover(amount, head) {
  const amt = Number(amount) || 0;
  if (amt > 1e5) return "Board";
  if (head === "contingency" || amt > 25e3) return "CEO";
  if (amt > 5e3) {
    if (head === "tech") return "CTO";
    if (head === "legal") return "CEO";
    return "COO";
  }
  if (head === "tech") return "CTO";
  if (head === "legal") return "CEO";
  return "Outlet Mgr";
}
__name(getExpenseApprover, "getExpenseApprover");
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } });
}
__name(json, "json");
function id() {
  return crypto.randomUUID();
}
__name(id, "id");
async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
async function constantTimeEqual(a, b) {
  const [x, y] = await Promise.all([sha256(String(a)), sha256(String(b))]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
__name(constantTimeEqual, "constantTimeEqual");
async function readBody(request) {
  const text = await request.text();
  if (text.length > 1e5) throw new Error("Request body too large.");
  return text ? JSON.parse(text) : {};
}
__name(readBody, "readBody");
function sessionCookie(request) {
  const cookie = request.headers.get("cookie") || "";
  const entry = cookie.split(";").map((x) => x.trim()).find((x) => x.startsWith("qbx_session="));
  return entry ? decodeURIComponent(entry.slice("qbx_session=".length)) : "";
}
__name(sessionCookie, "sessionCookie");
async function adminSession(request, env) {
  const token = sessionCookie(request);
  if (!token) return false;
  const hash = await sha256(token);
  const row = await env.DB.prepare("SELECT token_hash FROM sessions WHERE token_hash = ? AND expires_at > ?").bind(hash, Date.now()).first();
  return !!row;
}
__name(adminSession, "adminSession");
function publicRecord(resource, item) {
  const copy = { ...item };
  if (resource === "logs") {
    copy.cash = 0;
    copy.upi = 0;
    copy.chemicalCost = 0;
  }
  if (resource === "expenses") {
    copy.description = "Private expense record";
    copy.amount = 0;
    copy.requestedBy = "Private";
    copy.approver = "Private";
  }
  return copy;
}
__name(publicRecord, "publicRecord");
async function listRecords(env, resource) {
  const { results = [] } = await env.DB.prepare(
    "SELECT id, data FROM records WHERE resource = ? ORDER BY created_at DESC"
  ).bind(resource).all();
  return results.map((row) => {
    try {
      return { id: row.id, ...JSON.parse(row.data) };
    } catch {
      return { id: row.id };
    }
  });
}
__name(listRecords, "listRecords");
async function saveRecord(env, resource, record, recordId) {
  const rid = recordId || record.id || id();
  const current = await env.DB.prepare("SELECT data FROM records WHERE resource = ? AND id = ?").bind(resource, rid).first();
  const existing = current ? JSON.parse(current.data) : {};
  const merged = { ...existing, ...record, id: rid };
  if (resource === "expenses") {
    if (!merged.status) merged.status = "pending";
    if (!merged.approver) merged.approver = getExpenseApprover(merged.amount, merged.head);
  }
  await env.DB.prepare(
    `INSERT INTO records (resource, id, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(resource,id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`
  ).bind(resource, rid, JSON.stringify(merged), Date.now(), Date.now()).run();
  return merged;
}
__name(saveRecord, "saveRecord");
async function settingsGet(env) {
  const { results = [] } = await env.DB.prepare("SELECT key, value FROM settings").all();
  const settings = getDefaultSettings();
  for (const row of results) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }
  return settings;
}
__name(settingsGet, "settingsGet");
async function settingsPatch(env, patch) {
  const allowed = new Set(Object.keys(getDefaultSettings()));
  const statements = [];
  for (const [key, value] of Object.entries(patch)) {
    if (!allowed.has(key)) continue;
    statements.push(env.DB.prepare(
      "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    ).bind(key, JSON.stringify(value)));
  }
  if (statements.length) await env.DB.batch(statements);
  return await settingsGet(env);
}
__name(settingsPatch, "settingsPatch");
function csv(rows, keys, filename = "qubrix-export.csv") {
  const esc = /* @__PURE__ */ __name((v) => `"${String(v ?? "").replaceAll('"', '""')}"`, "esc");
  const lines = [keys.map(esc).join(",")];
  for (const row of rows) lines.push(keys.map((k) => esc(row[k])).join(","));
  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store"
    }
  });
}
__name(csv, "csv");
async function api(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method.toUpperCase();
  const isSecure = url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const secureFlag = isSecure ? "; Secure" : "";
  if (path === "/api/health" && method === "GET") return json({ ok: true, service: "qubrix-api" });
  if (path === "/api/admin/login" && method === "POST") {
    if (!env.ADMIN_PASSWORD) return json({ error: "Admin password secret is not configured." }, 503);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await sha256(ip);
    const since = Date.now() - 15 * 60 * 1e3;
    const attempts = await env.DB.prepare("SELECT COUNT(*) AS n FROM auth_attempts WHERE ip_hash = ? AND created_at > ?").bind(ipHash, since).first();
    if ((attempts?.n || 0) >= 5) return json({ error: "Too many login attempts. Try again in 15 minutes." }, 429);
    const body = await readBody(request);
    if (!await constantTimeEqual(body.password || "", env.ADMIN_PASSWORD)) {
      await env.DB.prepare("INSERT INTO auth_attempts (ip_hash, created_at) VALUES (?,?)").bind(ipHash, Date.now()).run();
      return json({ error: "Incorrect administrator password." }, 401);
    }
    await env.DB.prepare("DELETE FROM auth_attempts WHERE ip_hash = ?").bind(ipHash).run();
    try {
      await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(Date.now()).run();
      await env.DB.prepare("DELETE FROM auth_attempts WHERE created_at <= ?").bind(Date.now() - 24 * 60 * 60 * 1e3).run();
    } catch {
    }
    const token = id() + id();
    const expires = Date.now() + 12 * 60 * 60 * 1e3;
    await env.DB.prepare("INSERT INTO sessions (token_hash, expires_at, created_at) VALUES (?,?,?)").bind(await sha256(token), expires, Date.now()).run();
    return json({ ok: true, expiresAt: expires }, 200, {
      "set-cookie": `qbx_session=${encodeURIComponent(token)}; HttpOnly${secureFlag}; SameSite=Strict; Path=/; Max-Age=43200`
    });
  }
  if (path === "/api/admin/session" && method === "GET") {
    return json({ authenticated: await adminSession(request, env) });
  }
  if (path === "/api/admin/logout" && method === "POST") {
    const token = sessionCookie(request);
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "set-cookie": `qbx_session=; HttpOnly${secureFlag}; SameSite=Strict; Path=/; Max-Age=0` });
  }
  if (path.startsWith("/api/")) {
    const isAdmin = await adminSession(request, env);
    if (path.startsWith("/api/export/")) {
      const resource2 = path.split("/").pop();
      const exportKeys = {
        logs: ["date", "cars", "cash", "upi", "chemicalCost", "waitMinutes", "complaints", "newCustomers", "repeatCustomers"],
        expenses: ["date", "head", "description", "amount", "requestedBy", "approver", "status"],
        tasks: ["title", "phase", "owner", "dueDay", "status"],
        audits: ["date", "sopCode", "score", "auditor"],
        compliance: ["title", "form", "owner", "fixedDate", "note", "status"]
      };
      if (!exportKeys[resource2]) return json({ error: "Not found" }, 404);
      const rows = await listRecords(env, resource2);
      const safeRows = isAdmin ? rows : rows.map((x) => publicRecord(resource2, x));
      return csv(safeRows, exportKeys[resource2], `qubrix-${resource2}.csv`);
    }
    const match = path.match(/^\/api\/(tasks|compliance|logs|expenses|audits)(?:\/([^/]+))?$/);
    if (path === "/api/settings") {
      if (method === "GET") {
        const data = await settingsGet(env);
        if (!isAdmin) {
          data.whatsapp = "";
          for (const key of ["tech", "outlet", "chemicals", "legal", "contingency"]) data[key] = 0;
        }
        return json(data);
      }
      if (method === "PATCH") {
        if (!isAdmin) return json({ error: "Administrator login required." }, 401);
        return json(await settingsPatch(env, await readBody(request)));
      }
      return json({ error: "Method not allowed" }, 405);
    }
    if (!match) return json({ error: "API route not found" }, 404);
    const resource = match[1], recordId = match[2];
    if (!RESOURCES.has(resource)) return json({ error: "Not found" }, 404);
    if (method === "GET" && !recordId) {
      const rows = await listRecords(env, resource);
      return json(isAdmin ? rows : rows.map((x) => publicRecord(resource, x)));
    }
    if (!isAdmin) return json({ error: "Administrator login required. Use the Admin login button." }, 401);
    if (method === "POST" && !recordId) {
      const body = await readBody(request);
      if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid JSON object" }, 400);
      return json(await saveRecord(env, resource, body), 201);
    }
    if (method === "PATCH" && recordId) {
      const body = await readBody(request);
      const existing = await env.DB.prepare("SELECT id FROM records WHERE resource=? AND id=?").bind(resource, recordId).first();
      if (!existing) return json({ error: "Record not found" }, 404);
      return json(await saveRecord(env, resource, body, recordId));
    }
    if (method === "DELETE" && recordId) {
      await env.DB.prepare("DELETE FROM records WHERE resource=? AND id=?").bind(resource, recordId).run();
      return json({ ok: true });
    }
    return json({ error: "Method not allowed" }, 405);
  }
  return env.ASSETS.fetch(request);
}
__name(api, "api");
var worker_default = {
  async fetch(request, env) {
    try {
      return await api(request, env);
    } catch (error) {
      console.error("Qubrix request failed:", error?.message || error);
      return json({ error: "Server error. Check Worker logs." }, 500);
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-7nzyzu/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-7nzyzu/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
