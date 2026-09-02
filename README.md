# Personal Productivity Assistant (Sage) on Google Cloud Run
**Track 3: Automate Daily Operations with a Productivity Agent**
**Lab 3: Deploy Personal Productivity Assistant using Cloud Run**

A production-grade, enterprise-hardened AI productivity agent built for business owners to automate daily store operations—real-time sales tracking, inventory depletion alerts, automated purchase order generation, allergen safety verification, and customer cart processing on **Google Cloud Run**.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |     Client (React 18 + Tailwind)      |
                                  |   - Responsive Dashboard & Chat UI    |
                                  |   - Web Audio Procedural Synthesizer  |
                                  +-------------------+-------------------+
                                                      |
                                           HTTPS / JSON Payloads
                                                      |
                                                      v
+---------------------------------------------------------------------------------------------------+
|                               Google Cloud Run Node.js / Express Server                           |
|                                                                                                   |
|  [Security Middlewares]                                                                            |
|  ├── Sliding-Window Rate Limiter (30 req / 60s per IP)                                            |
|  ├── InputSanitizer (Recursive prototype pollution filter: __proto__, constructor, prototype)     |
|  └── Helmet-equivalent Security Headers (Strict CSP, X-Content-Type-Options: nosniff)            |
|                                                                                                   |
|  [Operational APIs & Core Engines]                                                                |
|  ├── /api/agent/chat  ──>  PromptGuard ──> XML Boundary (<user_query>) ──> Gemini SDK Agent       |
|  │                          (Pattern Scan & Output Redaction)                │                    |
|  │                                                                           ├── Function Tools   |
|  │                                                                           └── RAG Knowledge    |
|  ├── /api/cart/validate ──> CartSecurityValidator (100% Server-Authoritative Price Recalculation) |
|  ├── /api/inventory/restock ──> Stock Level Adjustments & 1-Click PO Automation                    |
|  ├── /api/sales, /api/catalog, /api/tasks, /api/features                                         |
|  └── /api/tests/run ──> 14/14 Automated Test Suite Runner (Unit, Security, E2E)                  |
+---------------------------------------------------------------------------------------------------+
```

---

## 🛡️ Defense-in-Depth Security Architecture

### 1. PromptGuard: Multi-Layer Prompt Injection & Jailbreak Defense
- **Adversarial Pattern Scanning**: Scans every incoming prompt against 9 known attack vectors:
  - DAN (Do Anything Now) mode activations
  - Instruction hijacking and system override commands (`ignore previous instructions`, `bypass rules`)
  - System prompt extraction probes (`reveal system instructions`, `print hidden variables`)
  - Roleplay escalations & developer mode bypasses
  - Script injections (`<script>`, `javascript:`)
- **XML Boundary Isolation**: Wraps sanitized queries in isolated XML envelopes (`<user_query>${sanitized}</user_query>`), preventing contextual confusion in the LLM.
- **Output Secret Redaction**: Intercepts model completions to scrub and redact sensitive API keys, tokens, or credential leaks before reaching the client.

### 2. CartSecurityValidator: Authoritative Price Recalculation
- **100% Server-Authoritative Calculation**: Completely rejects client-supplied unit prices or totals.
- **Strict Catalog Validation**: Matches item IDs against the authoritative server menu catalog.
- **Mathematical Sanitization**: Discards negative quantities, floating-point NaN attacks, and unapproved discount codes.
- **Tamper Alerting**: Flags tampering attempts in telemetry logs while returning verified mathematical totals.

### 3. InputSanitizer: Prototype Pollution Defense
- Recursively inspects nested request bodies.
- Purges dangerous prototype keys (`__proto__`, `constructor`, `prototype`) from objects and arrays before processing.

### 4. Sliding-Window Rate Limiting
- Tracks request timestamps per client IP within a rolling 60-second window.
- Returns standard `429 Too Many Requests` with `Retry-After` headers upon threshold breaches.

---

## 🔊 Procedural Ambient Audio Synthesizer

Built with the browser **Web Audio API** (zero external MP3 assets needed):
- **Brownian & Pink Noise Generator**: Simulates gentle background cafe murmur and warm room tone.
- **Procedural Steam Wand**: Low-pass filtered noise bursts replicating espresso milk steaming.
- **Cup & Saucer Resonance**: Dual-band pass filters tuned to high-frequency porcelain clinks (2.4kHz – 3.8kHz).
- **Chimes & Feedback**: Harmonic musical sine tones for actions, success confirmations, alerts, and security interceptions.

---

## 🧪 Automated Test Suite (14/14 Tests)

Run the full automated test suite directly in the CLI:
```bash
npx tsx tests/run-all-tests.ts
```

Or trigger the tests visually via the **"14/14 Tests"** modal button in the top navigation bar.

### Test Matrix Breakdown:
1. **Unit Tests (4 Tests)**:
   - RAG Knowledge Base Cosine Similarity Matching
   - Dietary Allergen Filtering (100% Dairy-Free)
   - Decaf Beverage Caffeine Limit Enforcement (&le;5mg)
   - Procedural Sound Synthesis Engine Initializer
2. **Security & Penetration Tests (6 Tests)**:
   - PromptGuard: Adversarial DAN Mode Interception
   - PromptGuard: Instruction Hijacking & System Override Blocking
   - PromptGuard: XML Boundary Isolation Enforcement
   - PromptGuard: Output Secret & API Key Redaction
   - CartSecurityValidator: Client-Side Price Tampering Defeat
   - InputSanitizer: Recursive Prototype Pollution Blocking
3. **End-to-End ADK Operations Tests (4 Tests)**:
   - Agent Function Calling: Live Sales Metrics Query
   - Agent Function Calling: Critical Inventory & Automated Restock PO
   - Sliding-Window Rate Limiter Throttling (30 req / 60s)
   - Full-Stack Express & Cloud Run Health Check Endpoint

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Security / Validator |
|---|---|---|---|
| `POST` | `/api/agent/chat` | Send conversational query to AI Barista Sage | Rate Limited, Input Sanitized, PromptGuard Isolated |
| `GET` | `/api/catalog` | Get menu catalog items and allergens | Public Read |
| `POST` | `/api/cart/validate` | Authoritative price check and checkout | `CartSecurityValidator` Server Recalculation |
| `GET` | `/api/sales` | Get daily sales metrics and hourly velocity | Authoritative Mock POS Stream |
| `GET` | `/api/inventory` | List stock items, buffer levels, and supplier lead times | Live Business State |
| `POST` | `/api/inventory/restock` | Trigger 1-click PO restock order | Authoritative Inventory Update |
| `GET` | `/api/tasks` | Get daily shift checklists (Opening/Midday/Closing) | Task Automation |
| `POST` | `/api/tasks/toggle` | Toggle operational task completed state | Operational Workflow |
| `GET` | `/api/features` | Get product roadmap features and priority votes | Feature Pipeline |
| `POST` | `/api/features/vote` | Upvote upcoming operational feature | Community Prioritization |
| `GET` | `/api/telemetry/recent` | Stream live ADK execution trace logs | Observability & Audit |
| `POST` | `/api/tests/run` | Execute 14/14 automated test suite | Automated Verification |
| `GET` | `/api/health` | Service health check | Uptime Monitoring |

---

## 🚀 Deployment to Google Cloud Run

To build and run the application container:

```bash
# Build frontend and compile backend
npm run build

# Start production server
npm start
```

For Cloud Run containerization, standard `PORT=3000` environment binding is configured out-of-the-box in `server.ts`.
