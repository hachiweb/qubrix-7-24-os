-- Optional seed data from Qubrix 7 24 Operating System specification
-- Run with: npm run db:seed:local (or npm run db:seed for remote)

-- Seed starter tasks (60-Day RACI Matrix)
INSERT OR IGNORE INTO records (resource, id, data, created_at, updated_at) VALUES
('tasks', 'task-1', '{"title":"DSC, DIN, Name approval, SPICe+","phase":1,"owner":"CA","dueDay":5,"status":"done"}', 1731650000000, 1731650000000),
('tasks', 'task-2', '{"title":"Bank account, PAN/TAN, GST registration","phase":1,"owner":"CA","dueDay":10,"status":"done"}', 1731650000000, 1731650000000),
('tasks', 'task-3', '{"title":"Co-founder Agreement & IP assignment sign","phase":1,"owner":"CEO","dueDay":7,"status":"done"}', 1731650000000, 1731650000000),
('tasks', 'task-4', '{"title":"First board meeting + first auditor appointment","phase":1,"owner":"CEO","dueDay":12,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-5', '{"title":"Trademark (Class 37 + Class 9) filing","phase":1,"owner":"CEO","dueDay":14,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-6', '{"title":"Location shortlist (3 options) & lease negotiation","phase":2,"owner":"COO","dueDay":20,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-7', '{"title":"SPCB CTE/CTO, Gumasta licence application","phase":2,"owner":"COO","dueDay":25,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-8', '{"title":"Pressure washers, vacuum, water recycling procurement","phase":2,"owner":"COO","dueDay":28,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-9', '{"title":"Cloud infra (AWS vs GCP) & API structure freeze","phase":2,"owner":"CTO","dueDay":18,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-10', '{"title":"Booking app & billing software core build","phase":3,"owner":"CTO","dueDay":35,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-11', '{"title":"Staff hiring (Outlet Manager, supervisors, washers) & training","phase":3,"owner":"COO","dueDay":40,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-12', '{"title":"Vendor tie-ups (chemicals, microfibers) & NDAs","phase":3,"owner":"COO","dueDay":38,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-13', '{"title":"INC-20A (commencement of business) ROC filing","phase":3,"owner":"CA","dueDay":42,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-14', '{"title":"Outlet branding, signage, Google Business Profile & local ads","phase":4,"owner":"Growth Mgr","dueDay":48,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-15', '{"title":"Trial run washes (10+ trial cars without major issue)","phase":4,"owner":"COO","dueDay":52,"status":"todo"}', 1731650000000, 1731650000000),
('tasks', 'task-16', '{"title":"Grand Opening & 50% launch offer campaign","phase":4,"owner":"CEO","dueDay":60,"status":"todo"}', 1731650000000, 1731650000000);

-- Seed compliance calendar
INSERT OR IGNORE INTO records (resource, id, data, created_at, updated_at) VALUES
('compliance', 'comp-1', '{"title":"First Board Meeting + Auditor appointment","form":"ADT-1","anchor":"incorporation","offset":30,"owner":"CA","note":"Companies Act Sec 173 ke under 30 din me","fixedDate":""}', 1731650000000, 1731650000000),
('compliance', 'comp-2', '{"title":"INC-20A (Commencement of business)","form":"INC-20A","anchor":"incorporation","offset":180,"owner":"CA","note":"Late penalty ₹50,000 aur strike-off risk","fixedDate":""}', 1731650000000, 1731650000000),
('compliance', 'comp-3', '{"title":"Monthly GST returns (GSTR-1 & GSTR-3B)","form":"GSTR-3B","anchor":"monthly","offset":20,"owner":"CA","note":"GST returns aur tax deposit","fixedDate":""}', 1731650000000, 1731650000000),
('compliance', 'comp-4', '{"title":"Monthly MIS & Books review","form":"MIS","anchor":"monthly","offset":10,"owner":"CA","note":"Monthly P&L, burn rate aur variance alert","fixedDate":""}', 1731650000000, 1731650000000);
