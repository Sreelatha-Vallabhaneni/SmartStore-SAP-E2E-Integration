# 🛒 SmartStore | End-to-End B2B Order-to-SAP Integration Cockpit

[![Live Demo](https://shields.io)](https://netlify.app)
[![Next.js](https://shields.io)](https://nextjs.org)
[![SAP Integration Suite](https://shields.io)](https://sap.com)
[![Groovy](https://shields.io)](https://groovy-lang.org)

**SmartStore** is a full-stack B2B Order-to-SAP integration solution and real-time observability cockpit. It demonstrates how a modern **Next.js** web application securely communicates with **SAP Cloud Integration (CPI)** through **SAP API Management**, featuring real-time payload inspection (Outgoing JSON, Transformed XML, and SAP HTTP Responses), automated business rule validation, content-based routing, and fault-tolerant error handling.

🌐 **Live Interactive App:** [smartstore-sap-e2e-integration.netlify.app](https://netlify.app)  
_(Note: Works out-of-the-box in **Simulation Mode** when an SAP BTP trial tenant is offline, or connects directly to a live SAP tenant via **SAP Settings**.)_

---

## 🏗️ End-to-End System Architecture

```text
┌─────────────────────┐      HTTPS / JSON      ┌──────────────────────────────┐
│   Next.js Frontend  │ ─────────────────────► │   Next.js Server API Route   │
│  (Order Cockpit UI) │                        │    (/api/submit-order)       │
└─────────────────────┘                        └──────────────┬───────────────┘
                                                              │ POST + APIKey Header
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SAP BTP Integration Suite                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       SAP API Management (Proxy)                      │  │
│  │  [Spike Arrest] ──► [Verify API Key] ──► [Encrypted KVM + BasicAuth]  │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │ Authenticated HTTPS                   │
│                                     ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   SAP Cloud Integration (CPI iFlow)                   │  │
│  │                                                                       │  │
│  │  [JSON to XML] ──► [Groovy Validation] ──► [Content-Based Router]     │  │
│  │                            │                     ├──► HIGH (> €1000)  │  │
│  │                            ▼ (Invalid Code)      └──► STANDARD        │  │
│  │                  [Exception Subprocess]                               │  │
│  │                  (HTTP 400 JSON Error)                                │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ Transformed Sales Order XML
                                      ▼
                        ┌───────────────────────────┐
                        │  S/4HANA Target / Webhook │
                        └───────────────────────────┘
```

---

## ✨ Key Features & Technical Stack

### 🖥️ 1. Frontend & Observability Cockpit (`Next.js App Router`)

- **Dual Execution Modes:**
  - **Live SAP BTP Mode:** Routes orders through SAP API Management to SAP CPI using an `APIKey`.
  - **Simulation Mode:** Built-in fallback engine that mirrors SAP CPI Groovy validation and routing rules so recruiters can test happy-path (`200 OK`) and validation error (`400 Bad Request`) flows anytime.
- **Server-Side BFF Proxy (`/api/submit-order`):** Prevents browser CORS issues and keeps SAP credentials protected on the server.
- **Live Payload Inspector:** Real-time terminal tabs displaying **Outgoing JSON**, **SAP Transformed XML**, and **SAP CPI HTTP Responses** (`X-Order-Priority`, `sapMessageId`).
- **Session KPI Dashboard:** Live metrics tracking Orders Sent, High-Value Priority Routes (`> €1,000`), and Integration Success Rate.

### 🛡️ 2. Enterprise Security (`SAP API Management`)

- **Traffic Throttling (`SpikeArrest`):** Limits incoming requests (`10pm`) on the `ProxyEndpoint` incoming stream to protect backend SAP systems from traffic spikes.
- **API Key Authentication (`VerifyAPIKey`):** Enforces `request.header.APIKey` validation linked to a published Developer Hub Product.
- **Zero-Hardcoded Secrets (`Encrypted KVM`):** Dynamically fetches CPI `clientid` and `clientsecret` from an encrypted Key Value Map (`CPI_Credentials_KVM`) into `private.` variables and encodes the outbound `Authorization` header in `TargetEndpoint`.

### ⚙️ 3. Middleware Orchestration (`SAP Cloud Integration / CPI`)

- **JSON to XML Converter:** Transforms incoming JSON payloads into structured XML (`OrderRequest`).
- **Groovy 4 Streaming DOM Script:** Uses `javax.xml.parsers.DocumentBuilderFactory` with `java.io.Reader` streaming for memory-safe XML parsing, validating **4-digit Danish postal codes** (`^\d{4}$`), calculating order totals, and setting `X-Order-Priority`.
- **Content-Based Router:** Evaluates `${property.OrderTotalAmount} > '1000'` to split orders into **High Priority** and **Standard** processing queues.
- **Exception Subprocess:** Catches Groovy validation exceptions and returns structured `HTTP 400 Bad Request` JSON responses.

---

## 🧪 Test Scenarios

| Scenario                           | Test Action in UI                                                       | Expected Pipeline Behavior                                                                                           |
| :--------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **1. Standard Order (Happy Path)** | Click **Fill Valid Order** (`Postal Code: 2630`, `Qty: 1`) → **Submit** | Passes API Mgmt & Groovy validation → Routed as `STANDARD` → Returns `HTTP 200 OK` + `sapMessageId`.                 |
| **2. High-Priority Routing**       | Set `Qty: 2` (`Total > €1,000`) → **Submit**                            | Sets `X-Order-Priority: HIGH` → Routed via High-Value branch → Returns `HTTP 200 OK`.                                |
| **3. Groovy Validation Failure**   | Click **Test Invalid Postal Code** (`Postal Code: 26300`) → **Submit**  | Rejected by Groovy regex `^\d{4}$` → Caught by **Exception Subprocess** → Returns `HTTP 400 Bad Request` JSON error. |
| **4. Unauthorized Request**        | Submit with invalid/missing `APIKey` in Live Mode                       | Blocked at API Management gateway → Returns `HTTP 401 Unauthorized`.                                                 |

---

## 📂 Repository Structure

```text
SmartStore-SAP-E2E-Integration/
├── app/
│   ├── api/
│   │   └── submit-order/
│   │       └── route.js              # Server-side proxy to SAP API Management
│   ├── components/
│   │   ├── ui/                       # Reusable Radix UI + Tailwind primitives
│   │   ├── Navbar.jsx                # Top navigation & SAP Settings trigger
│   │   ├── OrderForm.jsx             # B2B order form & quick-test controls
│   │   ├── IntegrationMonitor.jsx    # 4-stage pipeline visualizer & payload terminal
│   │   ├── RecentOrders.jsx          # Session audit log table
│   │   ├── SettingsDialog.jsx        # Live SAP Proxy URL & APIKey modal
│   │   └── Footer.jsx                # Architecture footer
│   └── page.js                       # Workspace state & orchestration
├── lib/
│   ├── orders.js                     # Currency formatting, XML preview & validation helpers
│   └── utils.js                      # Tailwind class merge utility
└── sap-artifacts/
    ├── exports/                      # Import-ready SAP archives (SmartStore_Integration.zip, APIProxy.zip)
    ├── SmartStore_Integration/       # Extracted CPI iFlow, BPMN & Groovy 4 validation script
    └── APIProxy/                     # Extracted API Management Proxy & XML security policies
```

---

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd SmartStore-SAP-E2E-Integration
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure SAP BTP Credentials (Optional):**
   Create a `.env.local` file in the project root (or enter credentials directly in the UI via **SAP Settings**):

   ```env
   SAP_API_PROXY_URL=https://<your-tenant>://
   SAP_API_KEY=<your-developer-hub-application-key>
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👩‍💻 Author

**Sreelatha Vallabhaneni** — Full-Stack Web Developer & SAP Integration Developer  
🌐 **Portfolio:** [sv-portfolio-v2.netlify.app](https://netlify.app)