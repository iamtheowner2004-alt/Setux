# SetuX — Autonomous AI Multi-Agent Societal Innovation Platform

> **Bridging Citizens, Academic Institutions, Industry Leaders, and Government Bodies to Solve Grassroots Societal Challenges.**

---

## Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [High-Level Architecture](#2-high-level-architecture)
3. [The Four-Pillar Ecosystem](#3-the-four-pillar-ecosystem)
4. [Tech Stack Deep Dive](#4-tech-stack-deep-dive)
5. [Detailed End-to-End Workflow & Lifecycle](#5-detailed-end-to-end-workflow--lifecycle)
6. [Core Algorithms, Scoring Models & AI Logic](#6-core-algorithms-scoring-models--ai-logic)
7. [Database Architecture & Collections](#7-database-architecture--collections)
8. [Complete API Endpoints Directory](#8-complete-api-endpoints-directory)
9. [User Roles, Portals & Credentials](#9-user-roles-portals--credentials)
10. [Execution Guide: How It Runs & Performs Actions](#10-execution-guide-how-it-runs--performs-actions)
11. [Fault Tolerance & Fallback Strategies](#11-fault-tolerance--fallback-strategies)

---

## 1. Executive Summary & Purpose

### What is SetuX?
**SetuX** (*"Setu"* meaning *bridge* in Sanskrit) is an autonomous, multi-agent artificial intelligence platform engineered to streamline the resolution of real-world civic, environmental, and infrastructure challenges across India.

### The Problem it Solves
Traditionally, civic issues reported by citizens face severe institutional bottlenecks:
- **No Direct Link to R&D:** Municipal complaints rarely reach engineering universities capable of designing technological innovations to fix root causes.
- **Duplicate Grievances:** The same community issue (e.g., arsenic water contamination, road collapse) is repeatedly submitted by different citizens without automated correlation.
- **Academic Research Silos:** Universities build prototypes and research papers that remain shelved without industry adoption or commercial mass-production.
- **Failed Industrial Adoption:** When private enterprise or MSMEs decline commercialization due to high capital expenditure, civic projects stall indefinitely without structured government intervention.

### The Solution Provided by SetuX
SetuX constructs a closed-loop multi-agent workflow:
1. **Citizen Ingestion:** Citizens submit grassroots issues with automated geo-location and reverse geocoding.
2. **AI Deduplication & Categorization:** Google Gemini and dense vector embeddings assess severity, priority, domain, and filter duplicates using cosine similarity ($\ge 85\%$).
3. **Autonomous Academic Discovery:** The system dynamically queries **OpenAlex** (a global catalog of scientific papers) filtered by Indian institutions (`country_code:IN`), identifies qualified Higher Education Institutions (IITs, NITs, Central Universities), and ranks them based on actual publication history.
4. **Human-in-the-Loop (HITL) Administration:** An administrator validates academic matches and triggers automated official invitation emails via SMTP.
5. **Industry Commercialization:** When a university proposes an engineering solution, SetuX uses **DuckDuckGo live web search** + **Google Gemini** to discover, screen, and rank real Indian manufacturing and CSR industry partners.
6. **Automatic Government Escalation:** If all industrial partners decline, the system autonomously synthesizes an executive **Government Policy Briefing** targeted at specific ministries (e.g., Ministry of Jal Shakti, MoHUA), ensuring no societal problem is left unaddressed.

---

## 2. High-Level Architecture

The SetuX platform operates as a cohesive, distributed tri-service architecture:

```
+---------------------------------------------------------------------------------------+
|                                    REACT FRONTEND                                     |
|                       Vite + React 19 + Tailwind CSS (Port 5173)                      |
|                                                                                       |
|   +-----------------------+   +------------------------+   +----------------------+   |
|   |  Public / Citizen UI  |   |  Admin HITL Dashboard  |   |  Agent Review Views  |   |
|   |  - Report Problem     |   |  - University Approval |   |  - University Match  |   |
|   |  - Geo-Location Tag   |   |  - Email Dispatcher    |   |  - Industry Match    |   |
|   |  - User Dashboard     |   |  - Policy Escalations  |   |  - Gov Policy Report |   |
|   +-----------------------+   +------------------------+   +----------------------+   |
+-------------------------------------------+-------------------------------------------+
                                            |
                         Bridges via central API service
                                            |
         +----------------------------------+----------------------------------+
         |                                                                     |
         v                                                                     v
+----------------------------------+               +------------------------------------+
|       EXPRESS NODE BACKEND       |               |        FASTAPI AI AGENT ENGINE     |
|          Node.js (Port 5000)     |  HTTP Proxy   |          Python 3.10+ (Port 8000)  |
|                                  | ------------> |                                    |
| - Citizen & Admin Authentication |               | - Problem Analyzer (Gemini Flash)  |
| - JWT Token Verification         | <------------ | - Semantic Deduplicator (Embeddings|
| - Problem Ingestion Controller   |   AI Data     | - OpenAlex Bibliographic Agent     |
| - MongoDB User / Problem Sync    |               | - DuckDuckGo Web Search Agent      |
+-----------------+----------------+               | - Industry Matcher & Ranker        |
                  |                                | - SMTP Outreach Email Generator    |
                  |                                | - Government Escalation Agent      |
                  |                                +------------------+-----------------+
                  |                                                   |
                  +-------------------------+-------------------------+
                                            |
                                            v
                         +-------------------------------------+
                         |          MONGODB DATABASE           |
                         |        societal_innovation          |
                         |                                     |
                         | - problems                          |
                         | - universities                      |
                         | - solutions                         |
                         | - industry_recommendations          |
                         | - government_reports                |
                         | - users                             |
                         +-------------------------------------+
```

---

## 3. The Four-Pillar Ecosystem

| Entity | Role in SetuX | Key Actions & Outputs |
| :--- | :--- | :--- |
| **1. Citizens** | Grievance Reporter & Beneficiary | Submits localized issues with title, description, and GPS coordinates; tracks real-time progress on citizen dashboard. |
| **2. Universities & HEIs** | Research & Prototyping Partner | Discovered dynamically via OpenAlex publications; receives invitation letters; develops innovative engineering solutions. |
| **3. Industry & MSMEs** | Fabrication & Scaling Partner | Identified via real-time web crawling; receives formal collaboration inquiries; provides funding, pilot testing, or manufacturing. |
| **4. Government Bodies** | Statutory Intervention & Grants | Receives comprehensive AI-generated policy escalation briefings with budgetary and administrative recommendations if private adoption fails. |

---

## 4. Tech Stack Deep Dive

### 4.1 Frontend Layer (`SetuX/frontend/setux-frontend`)
- **React 19 & Vite:** Ultra-fast bundling, single-page application routing, and reactive UI state management.
- **Tailwind CSS:** Modern utility-first design system with responsive cards, badges, and layout primitives.
- **React Router DOM (v7):** Route management separating public citizen portals (`/`, `/report-problem`, `/dashboard`) from secure administrator workflows (`/admin/login`, `/admin`, `/problem/:id/universities`, `/problem/:id/industries`).
- **Lucide React & OpenStreetMap Nominatim:** Interactive icon sets and client-side browser reverse geocoding converting latitude/longitude coordinates into human-readable physical addresses without paid Google Maps APIs.

### 4.2 Application Backend Layer (`SetuX/backend`)
- **Node.js & Express 5:** High-throughput REST API serving authentication and problem management.
- **Mongoose 9:** ODM providing schema validation, document life-cycle hooks, and auto-timestamps.
- **JWT (JSON Web Tokens) & bcryptjs:** Secure password hashing (10 salt rounds) and stateless token authorization.
- **Resilient Database Connector (`config/db.js`):** Enforces IPv4 DNS resolution (`dns.setDefaultResultOrder('ipv4first')`, using `8.8.8.8` and `1.1.1.1`) with a 3-attempt exponential retry loop.
- **FastAPI Proxy Controller:** Submits new problems directly to the Python AI engine using an `AbortController` (20-second timeout) and handles duplicate alerts seamlessly.

### 4.3 AI & Multi-Agent Engine (`AI-`)
- **Python 3.10+ & FastAPI:** Asynchronous ASGI framework powering all intelligent reasoning agents.
- **Google GenAI SDK (`google-gen-ai`):**
  - `gemini-3.6-flash`: High-speed reasoning model for problem categorization, academic query synthesis, industry suitability ranking, and policy briefing drafting.
  - `gemini-embedding-001`: Vector embeddings generation for cosine semantic deduplication.
- **OpenAlex Bibliographic API (`api.openalex.org`):** Open scientific literature index filtered by Indian institutions (`filter=institutions.country_code:IN`) to ground university matching in verifiable scientific publication track records.
- **DuckDuckGo Search (`ddgs` / `duckduckgo_search`):** Programmatic web search discovering active Indian corporate manufacturers and service providers without proprietary search API fees.
- **FastAPI-Mail & aiosmtplib:** Non-blocking asynchronous SMTP communication engine dispatching personalized university and industry outreach emails.
- **PyMongo & BSON:** Native MongoDB driver managing atomic state transitions on complex nested documents.

---

## 5. Detailed End-to-End Workflow & Lifecycle

The life of a problem through SetuX follows a strict 5-phase closed-loop progression:

```
[Phase 1: Ingestion & Discovery]
 Citizen Submits Issue 
   --> Semantic Deduplication Check (<85%?)
   --> Gemini Problem Analysis (Category, Severity, Priority, Keywords)
   --> OpenAlex Academic Search (Top Indian HEIs)
   --> Match Scoring (0-100) & Persistence -> Status: "pending_admin_review"
                                  |
                                  v
[Phase 2: Academic Outreach]
 Admin Reviews Candidates in HITL Dashboard
   --> Admin Approves University -> Status: "approved_for_university_outreach"
   --> AI Previews & Sends Official Email via SMTP -> Status: "university_contacted"
   --> University Decision Loop:
         * ACCEPTED -> Status: "university_accepted" -> Proceeds to Phase 3
         * DECLINED -> Auto-advances to Next Candidate -> Status: "pending_next_university"
         * ALL DECLINED -> Status: "all_universities_declined" -> Direct Gov Escalation
                                  |
                                  v
[Phase 3: Solution Submission & Industry Discovery]
 University Submits Solution (Title, Description, Tech Stack)
   --> Gemini Analyzes Solution (Viability, Limitations, Required Sectors)
   --> DuckDuckGo Crawls Real Indian Companies
   --> Gemini Evaluates & Ranks Indian Industrial Entities -> Status: "pending_admin_review"
                                  |
                                  v
[Phase 4: Industry Outreach & Commercialization]
 Admin Approves Industry Partner -> Status: "industry_approved"
   --> Admin Previews & Dispatches PPAP Invitation -> Status: "industry_invited"
   --> Industry Decision Loop:
         * ACCEPTED -> Status: "industry_collaboration_started" (Success!)
         * DECLINED -> Auto-advances to Next Industry Candidate
         * ALL DECLINED -> Status: "industry_declined" -> Triggers Phase 5
                                  |
                                  v
[Phase 5: Automated Government Escalation]
 Triggered Automatically when Market Options are Exhausted
   --> Gemini Analyzes Entire History (Problem + Solution + Failed Industry Outreach)
   --> Drafts Executive Policy Briefing with Budgetary & Statutory Recommendations
   --> Designates Relevant Ministry (e.g., Jal Shakti, MoHUA, Agriculture)
   --> Status: "escalated_to_government" / "pending_government_review"
```

---

## 6. Core Algorithms, Scoring Models & AI Logic

### 6.1 Dense Embedding & Cosine Similarity Deduplication
Located in `AI-/app/services/duplicate_detector.py`.
- **Text Embedding:** Concatenates `"title. description"` and passes it to `gemini-embedding-001` to produce a dense 768-dimensional vector (or a deterministic 128-dimensional SHA-256 fallback vector if offline).
- **Mathematical Formula:**
  $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$
- **Threshold Rule:** If similarity $\ge 85\%$, the system flags the issue as a duplicate, returns the existing matching problem ID, and terminates redundant processing.

### 6.2 Higher Education Institution (HEI) Filtering Engine
Located in `AI-/app/services/university_filter.py`.
Separates actual educational institutions from commercial or hospital entities:
- **Whitelist Keywords:** `university`, `institute of technology`, `iit`, `national institute of technology`, `nit`, `indian institute of science`, `college`, `school of`, `academy`.
- **Blacklist Keywords:** `hospital`, `private limited`, `pvt`, `ltd`, `company`, `corporation`, `laboratory`, `laboratories`.
- **Constraint:** A candidate is valid *if and only if* it matches $\ge 1$ whitelist term AND $0$ blacklist terms.

### 6.3 Academic Institution Ranking Model
Located in `AI-/app/services/university_matcher.py`.
Institutions are ranked on a 100-point composite score:
$$\text{Match Score} = \min(S_{\text{papers}} + S_{\text{website}} + S_{\text{volume}}, 100)$$
- **Paper Relevance ($S_{\text{papers}}$):** $\min(\text{relevant\_papers} \times 10, 60)$ points.
- **Verified Official Source ($S_{\text{website}}$):** $20$ points if official homepage URL exists, else $0$.
- **Historical Research Volume ($S_{\text{volume}}$):**
  - $\ge 10,000$ works: $20$ points
  - $\ge 5,000$ works: $15$ points
  - $\ge 1,000$ works: $10$ points
  - $> 0$ works: $5$ points

### 6.4 Industry Partner Discovery & Anti-Hallucination Ranking
Located in `AI-/app/services/industry_matcher.py` & `industry_search.py`.
- **Curated Indian Industry Registry:** Pre-compiled database of authentic Indian enterprises across 10 major domains (e.g., VA Tech Wabag, Thermax, Ion Exchange, Jain Irrigation, Re Sustainability).
- **Live Web Crawling:** Programmatically executes DuckDuckGo searches using AI-synthesized queries.
- **Strict Anti-Hallucination Prompting:** Gemini is strictly instructed:
  > *"Analyze ONLY the candidates provided above. Do not invent companies. Do not recommend a company unless it appears in the provided search candidates."*

### 6.5 Executive Government Escalation Generator
Located in `AI-/app/services/government_agent.py`.
Synthesizes a policy report containing:
- Executive problem and university solution summaries.
- Detailed industrial outreach failure analysis.
- Concrete administrative action items (e.g., Special Purpose Vehicle grants, municipal pilot deployments).
- Auto-mapped authority level and central ministry (e.g., Ministry of Jal Shakti, Ministry of Agriculture & Farmers Welfare, Ministry of Housing and Urban Affairs).

---

## 7. Database Architecture & Collections

**Database Name:** `societal_innovation`

### 1. `problems`
Stores citizen submissions, vector embeddings, Gemini analysis, academic matches, and state pointers.
```json
{
  "_id": "ObjectId",
  "title": "Severe Groundwater Contamination in Village",
  "description": "High levels of arsenic detected in tube wells...",
  "location": "Varanasi, Uttar Pradesh",
  "address": "Varanasi, Uttar Pradesh",
  "embedding": [0.012, -0.045, "... 768 float dimensions"],
  "ai_analysis": {
    "summary": "Critical groundwater toxicity affecting drinking supplies",
    "category": "Water Management",
    "subcategory": "Groundwater Remediation",
    "severity": "Critical",
    "priority_score": 88,
    "keywords": ["groundwater", "arsenic", "filtration"],
    "required_expertise": ["Environmental Engineering", "Hydrogeology"],
    "research_queries": ["groundwater arsenic remediation India"]
  },
  "university_recommendations": [
    {
      "name": "Indian Institute of Technology (BHU) Varanasi",
      "openalex_id": "https://openalex.org/I162827531",
      "country_code": "IN",
      "relevant_papers": 14,
      "official_website": "https://iitbhu.ac.in",
      "match_score": 95,
      "status": "pending | approved | contacted | accepted | declined"
    }
  ],
  "selected_university": { "...university object..." },
  "selected_university_index": 0,
  "university_response": "pending | accepted | declined",
  "status": "pending_admin_review | approved_for_university_outreach | university_contacted | university_accepted | pending_next_university | all_universities_declined"
}
```

### 2. `universities`
Master catalog of participating institutions, departments, labs, and nodal contact emails.

### 3. `solutions`
Stores technological solution proposals submitted by universities linked via `problem_id`.

### 4. `industry_recommendations`
Stores Gemini solution analyses, DuckDuckGo candidate hits, ranked Indian corporate partners, and outreach states (`pending_admin_review`, `industry_approved`, `industry_invited`, `industry_collaboration_started`, `industry_declined`, `escalated_to_government`).

### 5. `government_reports`
Synthesized executive escalation dossiers with urgency ratings, suggested ministries, and action points.

### 6. `users`
Citizen and administrator credentials managed by Express (`name`, `email`, `password` (bcrypt), `role`: `"user"` | `"admin"`).

---

## 8. Complete API Endpoints Directory

### 8.1 Express Node Backend (Port 5000)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register citizen account | No |
| `POST` | `/api/auth/login` | Citizen or master admin login | No |
| `POST` | `/api/auth/admin-login`| Dedicated administrator portal login | No |
| `POST` | `/api/problems` | Submit problem (proxies to AI Engine, checks duplicates) | Yes (JWT) |
| `GET` | `/api/problems/my-problems` | Fetch problems reported by logged-in citizen | Yes (JWT) |
| `GET` | `/api/problems/all` | Fetch all system problems (for dashboards) | Yes (JWT) |
| `GET` | `/api/problems/:id` | Fetch single problem details | Yes (JWT) |

### 8.2 FastAPI AI Engine (Port 8000)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service root check |
| `GET` | `/health` | Live MongoDB connection ping |
| `POST` | `/api/ai/analyze-problem` | Ingests problem, runs deduplication, OpenAlex query, and scoring |
| `GET` | `/api/research/match-universities`| Direct OpenAlex Indian HEI query utility |
| `GET` | `/api/admin/problems/pending` | Lists problems awaiting administrator review |
| `GET` | `/api/admin/problems/all` | Lists all problems in AI database |
| `POST` | `/api/admin/problems/{id}/approve-university` | Admin approves candidate university |
| `GET` | `/api/admin/problems/{id}/university-email-preview` | Previews personalized academic invitation email |
| `POST` | `/api/admin/problems/{id}/send-university-email` | Dispatches outreach email via SMTP |
| `POST` | `/api/universities/problems/{id}/respond` | Records university decision (`accept` / `decline`) |
| `POST` | `/api/ai/analyze-solution` | Evaluates university technical proposal viability |
| `POST` | `/api/ai/find-industries` | Analyzes solution, runs DuckDuckGo search, and ranks Indian industry partners |
| `GET` | `/api/admin/industry-recommendations/pending` | Lists industry matches awaiting admin review |
| `POST` | `/api/admin/industry-recommendations/{id}/approve-industry` | Admin approves industry partner |
| `GET` | `/api/admin/industry-recommendations/{id}/industry-email-preview` | Previews formal industry PPAP invitation |
| `POST` | `/api/admin/industry-recommendations/{id}/send-industry-email` | Sends industry collaboration email via SMTP |
| `POST` | `/api/industry/{id}/respond` | Records industry decision (`accepted` / `rejected` / `not_interested`) |
| `POST` | `/api/government/escalate/{recommendation_id}` | Synthesizes government escalation report (industry failed) |
| `POST` | `/api/government/escalate-problem/{problem_id}` | Synthesizes government escalation report (university failed) |
| `GET` | `/api/government/reports` | Lists all synthesized government escalation reports |

---

## 9. User Roles, Portals & Credentials

### 1. Citizen Portal
- **URL:** `http://localhost:5173/login` or `http://localhost:5173/signup`
- **Capabilities:**
  - Report localized societal challenges with auto-geolocation.
  - Receive instant AI duplicate alerts if identical issues were previously reported.
  - Track assigned university and industry status in real time.

### 2. Administrator (HITL Controller) Portal
- **URL:** `http://localhost:5173/admin/login`
- **Dashboard:** `http://localhost:5173/admin`
- **Master Admin Credentials:**
  - **Username:** `csmuadmin` *(or `csmuadmin@setux.org`)*
  - **Password:** `admin1234`
  - **Role:** `admin`
- **Capabilities:**
  - Review all citizen problems and AI analysis.
  - Vet and select matched Indian universities.
  - Customize, preview, and dispatch academic invitation emails.
  - Simulate/record university acceptance or rejection.
  - Trigger live DuckDuckGo + Gemini industrial partner discovery.
  - Vet and invite commercial entities.
  - Trigger or review executive Government Policy Escalation dossiers.

---

## 10. Execution Guide: How It Runs & Performs Actions

### Method 1: One-Click Launcher (Recommended)
Double-click the root batch script:
```bat
start-all.bat
```
This automatically initializes three independent terminal windows:
1. **SetuX AI Engine** on `http://localhost:8000` (FastAPI / Uvicorn)
2. **SetuX Node Backend** on `http://localhost:5000` (Express / Node.js)
3. **SetuX React Frontend** on `http://localhost:5173` (Vite / React)

---

### Method 2: Manual Step-by-Step Terminal Execution

#### Terminal 1: Python FastAPI AI Engine
```powershell
cd AI-
# Create virtual environment if not already present:
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Documentation & Swagger UI available at:* `http://localhost:8000/docs`

#### Terminal 2: Node.js Express Backend
```powershell
cd SetuX/backend
npm install
node server.js
```
*Backend runs on port 5000 (MongoDB connection verifies with `MongoDB connected successfully ✅`).*

#### Terminal 3: React Vite Frontend
```powershell
cd SetuX/frontend/setux-frontend
npm install
npm run dev
```
*Web application live at:* `http://localhost:5173/`

---

## 11. Fault Tolerance & Fallback Strategies

SetuX is architected with enterprise-grade resilience to ensure uninterrupted operation even when third-party services or internet connectivity experience disruption:

| Subsystem | Potential Failure Point | Automated Fallback Behavior |
| :--- | :--- | :--- |
| **Gemini LLM API** | Rate limiting, quota exhaustion, 503 HTTP spikes | Rule-based keyword extraction and severity scoring in `problem_analyzer.py` ensures 100% operational uptime without throwing unhandled exceptions. |
| **Vector Embeddings** | Google Embedding API latency | Deterministic SHA-256 128-dimensional embedding generator computes vector similarity offline. |
| **OpenAlex API** | Rate-limit throttling or timeout ($>3\text{s}$) | System supplements queries with a curated benchmark registry of top Indian HEIs (IIT Bombay, IIT Delhi, IISc, IIT Madras, IIT Roorkee, etc.). |
| **DuckDuckGo Search** | Captcha verification or network latency ($>7\text{s}$) | `industry_matcher.py` maintains an internal directory of verified Indian corporate enterprises across 10 core civic domains. |
| **MongoDB Atlas** | DNS SRV resolution issues on Windows | `config/db.js` enforces IPv4 resolution order with Google/Cloudflare public DNS servers and 3-attempt reconnect loops. |
| **AI Service Downtime** | FastAPI service temporarily stopped | Express problem controller wraps AI calls in a 20-second timeout with `AbortController`, seamlessly saving citizen submissions to MongoDB as fallback. |

---

*SetuX — Bridging Innovation for Societal Impact.*
