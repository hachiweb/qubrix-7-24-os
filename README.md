# Qubrix OS — Cloudflare deployment bundle

This bundle keeps the compiled Qubrix frontend from the supplied ZIP and adds a Cloudflare Worker API, D1 schema, public-view redaction, and password-protected admin writes.

## Security model

- Public visitors can load the app and view non-sensitive operational data.
- Public API responses redact daily cash/UPI revenue, chemical spend, expense descriptions/amounts/requesters/approvers, and the WhatsApp number.
- All create/update/delete API requests require an administrator session.
- Admin sessions expire after 12 hours and use an `HttpOnly`, `Secure`, `SameSite=Strict` cookie; JavaScript cannot read the session token.
- Login attempts are rate-limited to five failures per IP per 15 minutes.
- Set the admin password using a Cloudflare Worker secret. Never put it in source code or GitHub.

This is a starter security boundary, not a substitute for a professional security review before storing real customer or employee data. Do not store card details, passwords, identity documents, or highly sensitive customer data in this app.

## Deploy (Cloudflare Workers + Static Assets + D1)

Prerequisites: a Cloudflare account, Node.js 20+ and npm, and a terminal.

1. Extract this ZIP on your computer.
2. Open a terminal in the extracted `qubrix-cloudflare` folder.
3. Install the Wrangler CLI dependency:

   ```bash
   npm install
   ```

4. Log in to Cloudflare:

   ```bash
   npx wrangler login
   ```

5. Create the D1 database:

   ```bash
   npx wrangler d1 create qubrix-db
   ```

   Cloudflare prints a database UUID. Open `wrangler.jsonc` and replace `REPLACE_WITH_D1_DATABASE_ID` with that UUID.

6. Create the database tables:

   ```bash
   npx wrangler d1 execute qubrix-db --remote --file=./schema.sql
   ```

7. Set a strong admin password as a Cloudflare secret. Use a unique password of at least 14 characters:

   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   ```

   Paste the password only into the terminal prompt. Do not paste it into ChatGPT, GitHub, or this README.

8. Deploy:

   ```bash
   npx wrangler deploy
   ```

9. Open the `https://qubrix-os.<your-subdomain>.workers.dev` URL shown by Wrangler.
10. Click **Public view · Admin login** at the bottom-right. Enter your admin password. Changes made in the app will then be authenticated.

## GitHub (optional source backup)

Create a **private** GitHub repository, then from this folder run:

```bash
git init
git add .
git commit -m "Prepare Qubrix for Cloudflare"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/qubrix-cloudflare.git
git push -u origin main
```

Do not commit `.dev.vars`, `.env` files, passwords, API keys, or real customer data.

## API routes implemented

- `GET /api/tasks`, `POST /api/tasks`, `PATCH|DELETE /api/tasks/:id`
- `GET /api/compliance`, `POST /api/compliance`, `PATCH|DELETE /api/compliance/:id`
- `GET /api/logs`, `POST /api/logs`, `DELETE /api/logs/:id`
- `GET /api/expenses`, `POST /api/expenses`, `PATCH|DELETE /api/expenses/:id`
- `GET /api/audits`, `POST /api/audits`, `PATCH|DELETE /api/audits/:id`
- `GET|PATCH /api/settings`
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/health`
- `GET /api/export/tasks`, `GET /api/export/compliance`, `GET /api/export/logs`, `GET /api/export/expenses`, `GET /api/export/audits`

The frontend's original API calls are preserved. Initial starter tasks and compliance items can be seeded via `seed.sql`. Company settings have safe starter defaults (dynamically defaulted to current date).

## Local Development (Offline testing)

1. Copy `.dev.vars.example` to `.dev.vars` (default local password is set to `qubrix-admin-dev-pass-1234`).
2. Initialize local D1 database schema:
   ```bash
   npm run db:init:local
   ```
3. (Optional) Seed the 16 60-day launch plan tasks and compliance calendar from the Operating System specification:
   ```bash
   npm run db:seed:local
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:8787` in your browser. Click **Public view · Admin login** and enter `qubrix-admin-dev-pass-1234` to test authenticated admin edits.

## Free-tier notes

Cloudflare's published Workers Free limits include 100,000 Worker requests/day; static asset requests are free and unlimited. D1 Free includes 5 GB account storage, 5 million rows read/day and 100,000 rows written/day, subject to current Cloudflare limits and policy changes. The app's API requests and database operations still consume free-tier quotas. Check the official limits before launch:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/

## Important product limitations

- The supplied ZIP contains only the compiled frontend assets, not the original source project or original server implementation. This bundle implements a compatible API for the six routes detected in the frontend.
- The existing app does not include a complete user/role system. This starter provides one administrator password, not separate staff accounts.
- Public mode intentionally redacts financial fields. If you want a private finance area with multiple roles, implement a proper role-based access system before using this for live operations.
- The included login helper prompts for the password when the admin button is clicked or an edit is attempted. The password itself is never saved in browser storage; the session cookie is HttpOnly. The session is held in an HttpOnly cookie.
- The first deployment has empty tasks, compliance, logs, expenses and audits tables; the app can create them after login. Existing seed records were not present in the uploaded ZIP.
