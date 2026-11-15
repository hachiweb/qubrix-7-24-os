# Qubrix 7 24 Car Washing Pvt Ltd: Roles, Accountability aur Growth Operating System

Version 1.0 | Prepared: 12 November 2026 | Scope: Day 0–60 pilot + 12 months ka scale-up

Yeh document aapke 60-day plan, hiring plan, IP/legal plan aur ₹5,00,000 budget ko ek system me jodta hai: **kaun kya decide karega, kaun execute karega, kaun check karega, aur company har stage par aage kab badhegi.**

---

## 1. Organisation Structure (Kaun kiske under hai)

```
                    ┌──────────────────────────┐
                    │   BOARD OF DIRECTORS      │  (Founders / Directors)
                    │   Strategy, capital, legal│
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
 ┌──────▼───────┐        ┌───────▼────────┐       ┌───────▼──────────┐
 │ External CA   │        │   CEO           │       │ Statutory Auditor │
 │ (Accounts,    │◄──────►│ (Founder & MD)  │       │ (Independent CA   │
 │ Tax, ROC)     │        └───────┬────────┘       │  firm, reports to │
 └──────────────┘                 │                │  shareholders)    │
             ┌────────────────────┼────────────────┐└──────────────────┘
             │                    │                │
     ┌───────▼───────┐   ┌────────▼───────┐ ┌──────▼────────┐
     │ Co-founder 1   │   │ Co-founder 2    │ │ Growth /       │
     │ CTO (AI+Tech)  │   │ COO (Operations)│ │ Marketing Mgr  │
     └───────┬───────┘   └────────┬───────┘ └───────────────┘
             │                    │
   ┌─────────┼────────┐   ┌───────┼──────────────┐
   │         │        │   │       │              │
 AI/CV   Full-stack  QA  Outlet  Procurement   Finance & Admin
 Engineer Developer      Manager & Vendor Exec  Executive
                           │
                     Shift Supervisors
                           │
                  Washers / Detailers
```

**Important rule:** Har kaam ka ek hi "Owner" hoga. Do log ek kaam ke owner nahi ho sakte.

---

## 2. Role Cards (Har role ka exact kaam)

### 2.1 CEO (Founder & Managing Director)

**Mission:** Company ki direction, paisa, aur team ko ek line me rakhna.

| Area | CEO ki zimmedari | CEO kya NAHI karega |
|---|---|---|
| Strategy | Vision, 12-month roadmap, stage-gate decisions (Section 6) | Daily outlet operations |
| Capital | Fundraising, investor relations, cash runway monitoring | Bookkeeping / tax entries |
| Team | CTO/COO ko hire, review aur goal set karna; key hires final approve | Har washer ka interview |
| Brand | "Qubrix 7 24" aur "AutoClean AI" positioning, partnerships | Daily social media posting |
| Governance | Board meetings chair karna, legal agreements sign karna | Compliance forms khud bharna (CA ka kaam) |

**Weekly output:** Monday ko top-3 company priorities, Friday ko KPI review.
**KPIs:** Cash runway (months), monthly revenue growth %, key hires on time, stage-gate targets hit.

### 2.2 Co-founder 1: CTO (Technology + AI)

**Mission:** Booking app, AI vehicle analysis, data pipeline aur IP ko build aur protect karna.

| Area | Zimmedari |
|---|---|
| Architecture | AWS vs GCP decision, API structure freeze (48-hour action item ka owner) |
| Product | Booking app/website, billing software, dynamic pricing engine |
| AI | YOLOv8 pipeline, image dataset, recommendation accuracy |
| Hardware-software link | Outlet camera mounting angles aur edge hardware ka tech spec (COO ke saath) |
| IP | Code repo access control, model weights ka backup, copyright documentation (CA/lawyer ko input) |
| Team | AI Engineer, Full-stack Developer, QA ko manage karna |

**KPIs:** App uptime (target 99%+), booking-to-payment success rate, AI recommendation accuracy, release on time, zero data-loss incidents.

### 2.3 Co-founder 2: COO (Operations + Pilot)

**Mission:** Outlet ko bina rukawat 24/7 chalana aur har car wash ko same quality me dena.

| Area | Zimmedari |
|---|---|
| Location | Pilot location shortlist (3 options with footfall), lease negotiation |
| Approvals (physical) | SPCB CTE/CTO, Gumasta licence, water/ETP setup coordinate karna (paperwork CA/consultant ke saath) |
| Equipment | Pressure washers, vacuums, recycling unit procurement aur maintenance |
| People | Outlet Manager, supervisors, washers hire + train karna; shift roster |
| SOP | Wash SOP, safety SOP, customer handover SOP banana aur audit karna |
| Vendors | Shampoo, wax, microfiber ke vendors; NDA wale chemical vendors |

**KPIs:** Cars/day, average wash time, queue waiting time, repeat customer %, chemical cost per car, water recycled %, customer rating (Google 4.5+).

### 2.4 Growth / Marketing Manager

**Mission:** Customers laana aur unhe repeat banana.

- Google Business Profile, Instagram/Facebook local ads, launch offer (50% off / free vacuum)
- Signage aur branding (COO ke saath installation)
- Referral program, monthly subscription plans, corporate/fleet tie-ups
- **KPIs:** Cost per acquisition (CAC), new customers/week, subscription sign-ups, Google reviews count.

### 2.5 Outlet Manager

**Mission:** Ek outlet ka P&L aur daily quality.

- Shift roster (3 shifts for 24/7), attendance, opening/closing checklist
- Daily cash + UPI reconciliation report Finance Executive ko
- Customer complaints 24 ghante me close karna
- Technicians ko app update aur camera process follow karwana
- **KPIs:** Daily revenue vs target, complaints closed, SOP audit score, staff absenteeism.

### 2.6 Finance & Admin Executive (In-house)

- Daily sales entry, vendor bills, petty cash, payroll inputs
- Har mahine ki 3 tareekh tak sab documents CA ko bhejna
- Budget vs actual tracker update (Section 5)
- **KPIs:** Month-close on time, zero missing bills, payment to vendors on agreed terms.

### 2.7 CA (External Chartered Accountant) — Exact Positioning

CA company ka employee nahi, **external professional partner** hai. Do alag roles rakhein:

| | Accounting & Tax CA | Statutory Auditor |
|---|---|---|
| Kaam | Books, GST, TDS, payroll compliance, ROC filings, MIS | Saal ke end me accounts ka independent audit |
| Kaun appoint karta hai | CEO / Board (engagement letter se) | Pehla auditor Board 30 din ke andar appoint karta hai ([TAXAJ](https://www.taxaj.com/annual-filing-of-company)) |
| Kise report karta hai | CEO + Finance Executive | Shareholders |
| Note | Same firm dono kaam na kare — auditor ki independence zaroori hai (Companies Act Section 144 ke under auditor accounting/bookkeeping services nahi de sakta). CA se confirm karein. | |

**CA ka monthly scope (engagement letter me likhwayein):**
1. Monthly bookkeeping review aur MIS report (P&L, cash flow, burn rate) — har mahine ki 10 tareekh tak
2. GST returns (GSTR-1, GSTR-3B) aur TDS deposit/returns — monthly/quarterly due dates CA se calendar me lock karein
3. Payroll: PF/ESIC applicability check (staff count badhne par)
4. ROC compliance (Section 7 calendar)
5. Startup India (DPIIT) recognition aur tax benefit applicability advise
6. Investor due-diligence ke liye clean books aur cap table record
7. Budget variance par CEO ko alert jab koi head 10% se upar jaye

**CA KPIs:** Zero late fees/penalties, MIS on time, GST/TDS 100% on time.

---

## 3. RACI Matrix (60-Day Plan ke har kaam ka owner)

R = Karega (Responsible) · A = Final jawabdeh (Accountable) · C = Salah dega (Consulted) · I = Jaankari milegi (Informed)

| Kaam | CEO | CTO | COO | CA | Growth Mgr | Outlet Mgr |
|---|---|---|---|---|---|---|
| DSC, DIN, Name approval, SPICe+ | A | I | I | R | – | – |
| Bank account, PAN/TAN, GST | A | – | I | R | – | – |
| First board meeting + auditor appointment | A/R | C | C | C | – | – |
| INC-20A (commencement of business) | A | – | – | R | – | – |
| Trademark (Class 37 + Class 9) filing | A | C | I | C (lawyer R) | C | – |
| Location shortlist & lease | A | C | R | C (lease stamp duty/GST) | C | – |
| SPCB CTE/CTO, Gumasta licence | I | – | A/R | C | – | C |
| Equipment + water recycling | C | C | A/R | C (capex entry) | – | C |
| Cloud (AWS vs GCP) + API freeze | C | A/R | I | C (cost) | – | – |
| Booking app + billing software | C | A/R | C | C (GST invoice format) | C | I |
| Staff hiring & training | C | R (tech) | A/R (ops) | C (payroll) | – | R |
| Vendor tie-ups + NDA | C | – | A/R | C | – | I |
| Branding, signage, Google, ads | A | C | C | – | R | I |
| Trial run (Day 50–55) | I | R | A | – | C | R |
| Launch offer & Grand Opening | A | R | R | C (offer accounting) | R | R |
| Budget tracking | A | C | C | R | C | I |

---

## 4. Decision Rights aur Spending Limits

Isse har kharcha CEO tak nahi aayega, aur bada kharcha bina approval nahi hoga.

| Kharcha / Decision | Kaun approve kare |
|---|---|
| ₹5,000 tak (consumables, petty cash) | Outlet Manager |
| ₹5,001 – ₹25,000 | COO (ops) / CTO (tech) — apne budget head ke andar |
| ₹25,001 – ₹1,00,000 | CEO |
| ₹1,00,000 se upar, ya koi bhi lease / loan / equity / hiring above budget | Board resolution |
| Pricing change | COO propose → CEO approve |
| New outlet / city | Board (stage-gate criteria pass hone par hi) |
| Customer data sharing with any third party | CEO + CTO dono, written approval |

**Payment rule:** Bank payments me "maker-checker" — Finance Executive entry banaye, CEO/COO approve kare.

---

## 5. Budget Ownership (₹5,00,000)

| Head | Amount | Owner | Check by CA |
|---|---|---|---|
| Tech Infra & AI Core (40%) | ₹2,00,000 | CTO | Monthly |
| Pilot Outlet Branding & Hardware (25%) | ₹1,25,000 | COO (+ Growth Mgr for signage) | Monthly |
| Chemical Kits Supply (15%) | ₹75,000 | COO | Monthly |
| Legal, TM & SPCB NOC (12%) | ₹60,000 | CEO | Monthly |
| Emergency Contingency (8%) | ₹40,000 | CEO only | Har use par |

**Reality check (zaroor dhyaan dein):**
- ₹2,00,000 me cloud + AI Lead + Full-stack Developer ki 60-day salary mushkil hai. Ya to salaries budget alag rakhein, ya developers ko lower fixed pay + ESOP par lein.
- Staff salaries (washers, outlet manager), rent/deposit, aur bijli-paani ka line item is budget me nahi hai. CA ke saath ek **monthly burn sheet** banayein: fixed cost + variable cost per car.

---

## 6. Standardised Growth Stages (Stage-Gate System)

Company tabhi agle stage me jaayegi jab current stage ke **exit criteria** pass ho. Yeh decision Board meeting me hoga.

### Stage 0: Foundation (Day 0–60)
- **Goal:** Company legal, outlet ready, launch
- **Exit criteria:** Incorporation + GST + bank done · CTE/CTO aur Gumasta mil gaye · App live · 10+ trial washes bina major issue · Grand Opening done

### Stage 1: Pilot Validation (Month 3–6)
- **Goal:** Prove karna ki ek outlet profitable aur repeatable hai
- **Exit criteria (example targets — CEO set kare):**
  - Daily average cars: 40+
  - Repeat customers: 30%+
  - Contribution margin per car positive (revenue − chemicals − water − direct labour)
  - Google rating 4.5+ with 100+ reviews
  - All SOPs written and audit score 85%+
  - Monthly MIS 3 mahine lagataar time par

### Stage 2: Cluster Expansion (Month 7–12)
- **Goal:** Raipur me 3–5 outlets same SOP ke saath
- **Exit criteria:** Har naya outlet 90 din me breakeven · Central procurement · AI recommendation accuracy target hit · Subscription revenue 20%+ of total
- **New roles:** Area Manager, HR Executive, Customer Support lead

### Stage 3: Franchise / Multi-city (Year 2+)
- **Goal:** Asset-light expansion (Qubrix owns tech + data, partner runs outlet)
- **Pre-requisites:** Trademark registered · Franchise agreement + Franchise Operations Manual · Training academy · Seed/Pre-Series A funding

---

## 7. Compliance Calendar (Owner: CA, Accountable: CEO)

| Kab | Kya | Note |
|---|---|---|
| Incorporation ke 30 din me | First Board Meeting + first auditor appointment | Board meeting Section 173 ke under 30 din me, uske baad saal me minimum 4 meetings aur do meetings ke beech 120 din se zyada gap nahi ([EquityList](https://www.equitylist.co/blog-post/roc-compliance-calendar)) |
| Incorporation ke 180 din me | INC-20A (commencement of business) | Late hone par ₹50,000 penalty aur strike-off risk ([TAXAJ](https://www.taxaj.com/annual-filing-of-company)) |
| Har mahine | GST returns, TDS deposit, payroll | Exact dates CA calendar me lock kare |
| First FY end ke 9 mahine me | First AGM | Baad ke saalon me AGM normally 30 September tak ([Ofin Legal](https://ofinlegal.com/tools-calculators/roc-compliance-calendar/)) |
| AGM ke 15 / 30 / 60 din me | ADT-1 / AOC-4 / MGT-7 or MGT-7A | Sab due dates AGM date se count hoti hain ([CS Pratik](https://learn.cspratik.com/docs/compliance-insights/companies-act/annual-filings/annual-roc-compliance-calendar-private-limited-company/)) |
| Har teesre financial year, 30 June tak | DIR-3 KYC Web (har director) | 31 March 2026 se yeh annual nahi, 3 saal me ek baar hai ([TaxGarden](https://taxgarden.in/services/roc-annual-compliance)) |
| Mobile/email/address change ke 30 din me | DIR-3 KYC update | ([CSA Vilsalins](https://csavilsalins.com/compliance-calendar)) |
| Annually | SPCB consent renewal, Gumasta renewal | COO owner, CA tracks |

---

## 8. Meeting Rhythm (Operating Cadence)

| Meeting | Kab | Kaun | Output |
|---|---|---|---|
| Outlet huddle | Har shift start, 10 min | Outlet Mgr + staff | Target, safety, issues |
| Founders stand-up | Roz, 15 min | CEO, CTO, COO | Blockers clear |
| Weekly KPI review | Har Friday, 60 min | Founders + all managers | KPI dashboard, next-week top 3 |
| Monthly finance review | Har mahine 10–12 tareekh | CEO + CA + Finance Exec | MIS, burn, budget variance |
| Board meeting | Quarterly (minimum 4/year) | Directors (+ CA invited) | Stage-gate decisions, approvals, minutes |
| Monthly SOP audit | Mahine me 1 baar, surprise | COO | Audit score per outlet |

---

## 9. KPI Dashboard (Ek sheet, sab ke liye)

| KPI | Owner | Frequency | Target (Stage 1) |
|---|---|---|---|
| Cars washed / day | Outlet Mgr | Daily | 40+ |
| Revenue / day | Outlet Mgr | Daily | CEO set kare |
| Avg. wait time | COO | Daily | < 15 min |
| Repeat customer % | Growth Mgr | Monthly | 30%+ |
| CAC (₹ per new customer) | Growth Mgr | Weekly | Avg. ticket se kam |
| App uptime | CTO | Weekly | 99%+ |
| AI recommendation accept rate | CTO | Weekly | Increasing trend |
| Chemical cost / car | COO | Monthly | Budget ke andar |
| Water recycled % | COO | Monthly | SPCB condition ke hisaab se |
| Cash runway (months) | CEO + CA | Monthly | 6+ months |
| Compliance late fees | CA | Monthly | ₹0 |

---

## 10. SOP Library (Har process likha hua hona chahiye)

| SOP Code | Naam | Owner |
|---|---|---|
| OPS-01 | Car receiving, photo capture & damage check | COO |
| OPS-02 | Basic / Premium / Detailing wash steps | COO |
| OPS-03 | Chemical handling & storage | COO |
| OPS-04 | Shift handover & cash reconciliation | Outlet Mgr |
| OPS-05 | Customer complaint & damage claim | Outlet Mgr |
| TECH-01 | App release & rollback | CTO |
| TECH-02 | Data backup, access control & IP protection | CTO |
| FIN-01 | Purchase request → approval → payment | Finance Exec + CA |
| FIN-02 | Month-end closing | CA |
| HR-01 | Hiring, onboarding, training checklist | COO |
| MKT-01 | Offer approval & discount accounting | Growth Mgr |

Har SOP me: purpose, steps, owner, checklist, aur version number. Change sirf owner + CEO approval se.

---

## 11. Co-founder Agreement (Sabse pehle sign karein)

Co-founders ke beech written Founders' Agreement / Shareholders' Agreement hona chahiye:
- **Equity split** aur **vesting** (common startup practice: 4 saal vesting, 1 saal cliff)
- Role clarity (yeh document ka Section 2 attach karein)
- Decision deadlock hone par process (CEO casting vote / Board vote)
- Exit, leaver clauses (good leaver / bad leaver)
- IP assignment: sab code, data, model weights company ke naam
- ESOP pool (e.g., 10%) future hires ke liye reserve

**Legal note:** Aapke HR plan me "employment khatam hone ke baad 1 saal non-compete" likha hai. India me Indian Contract Act Section 27 ke under post-employment non-compete aam taur par enforce nahi hota. Isse confidentiality + non-solicitation + IP assignment clauses me badlein, aur lawyer se draft verify karayein.

---

## 12. Agle 7 Din ka Action Plan

| Din | Action | Owner |
|---|---|---|
| 1 | Yeh role document founders ke saath finalize aur sign | CEO |
| 1–2 | CA engagement letter (scope Section 2.7) sign; alag statutory auditor shortlist | CEO + CA |
| 2 | Founders' Agreement draft lawyer ko | CEO |
| 3 | AWS vs GCP cost sheet + API freeze | CTO |
| 3 | 3 location options with footfall data | COO |
| 4 | KPI dashboard (Google Sheet) + budget vs actual tracker | CA + Finance Exec |
| 5 | Spending limit matrix (Section 4) Board resolution se approve | Board |
| 6 | JDs post (Wellfound, Cutshort) | CTO + COO |
| 7 | First Weekly KPI Review meeting | CEO |

---

**Disclaimer:** Compliance dates aur legal points general guidance hain. Final filing dates aur agreements apne CA aur company lawyer se confirm karein, kyunki MCA kabhi kabhi due dates extend ya rules change karta hai.
