# ScamSentry — AI-Powered Digital Risk Protection Platform (DRPP)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Security_SOC-Online-emerald)](http://localhost:3000)

**ScamSentry** is an enterprise-grade, AI-powered Digital Risk Protection Platform designed to discover, investigate, prioritize, and respond to cyber threats and brand abuse across social media, websites, and mobile applications.

It operates as a unified Security Operations Center (SOC) combining an **AI Threat Investigation Copilot**, **multi-factor heuristic scoring**, **campaign entity graph correlation**, and **platform takedown orchestration**.

---

## 1. Product Vision & Core Architecture

ScamSentry answers five critical cybersecurity questions:
1. **Who is impersonating our brand online?** Continuous discovery of lookalikes across X, Instagram, Facebook, Telegram, domains, and app stores.
2. **Which digital threats are targeting our customers?** Flagging fake customer support handles, phishing login forms, homoglyph typosquats, and banking trojans.
3. **Which threats require immediate attention?** Normalized 0–100 risk scoring with transparent severity bands (Low, Medium, High, Critical).
4. **What evidence supports each threat?** Observable telemetry logs, certificate transparency, sandboxed DOM inspections, and fuzzy lexical distance matches.
5. **How can security teams track and resolve threats efficiently?** End-to-end response center with pre-formulated platform abuse reports and human approval workflows.

---

## 2. Core Threat Detection Modules

### A. Social Media Impersonation Detection
- Phonetic, Levenshtein, and fuzzy string similarity comparison against verified brand handles.
- Detection of fake customer support profiles (`@novapay_support_agent`), executive impersonation (e.g., CEO Elena Vance), and deceptive giveaway schemes.
- Discovers off-platform redirection links in bios targeting encrypted messengers or shortlinks (`t.me/`, `bit.ly`).

### B. Brand Impersonation & Phishing Website Detection
- Detects typosquatting, deceptive subdomains, and homoglyphs (e.g. `n0vapay-claims.com`, `novapay-verify.cc`).
- Inspects certificate transparency logs for ephemeral Let's Encrypt certificates issued within 72 hours.
- **Air-Gapped Safe URL Sandbox**: Isolated mock DOM inspector examining form actions and exfiltration endpoints without visiting live malicious sites.

### C. Suspicious Mobile Application Detection
- Identifies unverified Android APKs (`com.novapay.fastwallet`) and fake app store listings mimicking legitimate mobile applications.
- Flags dangerous manifest permissions (`READ_SMS`, `RECEIVE_SMS`, `BIND_ACCESSIBILITY_SERVICE`) associated with banking overlays and SMS stealer trojans.

### D. Scam Account & Fraud Campaign Detection
- Correlates isolated alerts into coordinated syndicates (e.g. **Operation MiragePay**).
- Entity relationship graph connecting brands, hostile social handles, phishing C2 domains, rogue mobile apps, shared Telegram bots, and cryptocurrency loot wallets.

---

## 3. Hybrid AI Detection & Risk Scoring Engine

ScamSentry rejects black-box scoring. Every score (0–100) is deterministically explainable across 5 weighted dimensions:

$$\text{Risk Score} = \text{Similarity (25)} + \text{Deceptive Intent (25)} + \text{Technical Indicators (20)} + \text{Impact Radius (15)} + \text{Confidence (15)}$$

### Severity Bands:
- **0–24 (Low)**: Minor lexical overlap, monitored without active escalation.
- **25–49 (Medium)**: Lookalikes without confirmed malicious payload.
- **50–74 (High)**: Active deceptive patterns, abusive terminology, and unverified mirrors.
- **75–100 (Critical)**: Confirmed credential harvesting, banking trojans, or executive impersonation.

---

## 4. Grounded AI Investigation Copilot

The AI Copilot assists SOC analysts with evidence-grounded queries:
- *"Why was this profile flagged?"* — Delivers itemized score breakdown and observable signals.
- *"Draft a platform-appropriate abuse report"* — Generates copy-paste-ready RFC/legal notices for X Safety Ops, Meta Brand Rights, Google SafeBrowsing, or ICANN Registrars.
- *"Are these accounts part of the same campaign?"* — Analyzes shared C2 infrastructure, identical hosting ASNs, and payment wallets.
- *"Summarize this incident for CISO"* — Generates concise executive incident briefings.

Every response distinguishes:
- `[OBSERVED TELEMETRY EVIDENCE]`
- `[AI INTERPRETATION]`
- `[SUGGESTED ACTION]`
- `[HUMAN APPROVAL REQUIRED]`

---

## 5. Enterprise SOC User Interface

- **Navigation**: Left sidebar with live count badges, global header with custom Brand Profile Configurator, and role-based access control (Admin, Senior SOC Analyst, Threat Investigator, Executive).
- **KPI Metrics**: Real-time counters for Total Threats, Critical Risks, Active Investigations, Campaigns, and Mean Time to Resolve (MTTR).
- **Analytics Charts**: 7-day ingestion velocity trend, severity risk profile, and category vector breakdown.
- **Live Threat Feed**: Filterable by severity, platform, category, lifecycle stage, and keyword search.
- **Investigation Drawer**: Full drill-down modal showcasing Basic Entity Details (with publisher/developer org info), Numerical Risk Score & Severity Gauge, Evidence Indicator Chain (typosquatting & leetspeak breakdown, deceptive affixes, AI visual logo similarity %, phishing/permissions audit), Linked IOCs, and Actionable Safety Verdict with one-click automated takedown notice generator.
- **On-Demand Live Scanner**: Test custom URLs, handles, or APK packages on the fly with instant scoring.
- **Response Center**: Takedown coordination tracking, verification checklists, and audit logging.
- **Executive Reports**: Board-ready summary report with printable PDF styling and JSON export.
- **Security Audit Trail**: Immutable ledger of all analyst actions with user IDs and IP addresses.

---

## 6. Flexible Brand Profile & Demonstration Scenario

The platform supports clean empty-state onboarding or instant customizable sample telemetry:
- **Clean Empty State**: Clear all threats to start with an empty dashboard and manually scan/monitor assets.
- **Configurable Brand Profile**: Customize your company name and primary domain directly from the header dropdown.
- **Sample Telemetry Generator**: Seed realistic digital risk telemetry customized dynamically for whatever brand name you specify:
  - **Social Impersonation**: Lookalike handle with fake support affixes
  - **Phishing Domain**: Typo-squat domain with ephemeral SSL and credential harvesting form
  - **Banking Trojan APK**: Sideloaded package with intrusive SMS and accessibility permissions
  - **Homoglyph Phish**: Number substitution targeting Web3 wallets
  - **Coordinated Syndicate**: Grouping shared C2 hosts, Telegram lure channels, and crypto drainer contracts.

---

## 7. Local Development & Running

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Execution
```bash
# Clone or navigate to the project directory
cd ScamScentry

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```
