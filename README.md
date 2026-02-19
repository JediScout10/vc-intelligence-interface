# VC Intelligence Interface – Precision AI Scout

**Assignment Submission – February 2026**

This project was built as part of VC Sourcing Assignment.

It is a thesis-driven venture capital sourcing interface that transforms company research from basic browsing into structured, explainable, deterministic investment matching.

---

# 🎯 Objective

Build a sourcing tool that:

* Accepts an investment thesis
* Enriches company data
* Scores companies deterministically
* Explains why a company matches
* Displays derived company signals
* Supports lists and saved searches

---

# 🏗 System Overview

The platform converts qualitative investment criteria into structured company scoring using deterministic logic.

## Core Flow

1. User defines investment thesis.
2. Company data is enriched (LLM + fallback).
3. Scoring engine matches thesis to company.
4. UI displays explainable score and signals.
5. User can organize companies into lists.

---

# 🚀 Features

## 1. Thesis-Driven Scoring

* Global thesis input stored in localStorage
* Keyword extraction from thesis
* Deterministic scoring (0–100 scale)
* Industry + stage + signal matching
* Real-time score updates when thesis changes

---

## 2. Explainable Matching

* Color-coded score bands
* Matched keywords clearly displayed
* Signal-based reasoning
* No hallucinated logic (fully deterministic)

---

## 3. Enrichment Pipeline

Website → Fetch (8s timeout) → HTML Cleaning →
LLM Extraction (if API key present) →
Fallback Heuristic Extraction (if LLM unavailable) →
Structured JSON Output

### Reliability Guarantees

* Always returns structured JSON
* Never crashes if API key missing
* Graceful fallback system
* 5-minute in-memory cache

---

## 4. Signal Timeline

Derived signals from website content such as:

* Funding mentions
* Hiring activity
* API / developer presence
* Enterprise focus
* Team size indicators

Signals are displayed in structured format for rapid VC evaluation.

---

## 5. Lists & Saved Searches

### Lists

* Create custom lists
* Add companies to lists
* Persistent via localStorage

### Saved Searches

* Save filtered views
* Quickly re-run sourcing criteria
* Improves repeat workflow efficiency

---

# 🧠 Scoring Model

Maximum Score: 100

* Keyword match: +10 each
* Industry match: +15
* Stage match: +10
* Signal match: +5 each

Scoring is deterministic and reproducible.

---

# ⚙️ Technical Stack

* Next.js 16 (App Router)
* TypeScript
* React
* Tailwind CSS
* Optional OpenAI (LLM enrichment)
* LocalStorage persistence
* In-memory caching

---

# 🔒 Error Handling Strategy

Multi-layer safety:

* Safe JSON parsing
* Fallback extraction
* Timeout handling
* No frontend JSON crashes
* Always structured API responses

---

# 📦 Setup Instructions

## 1. Install dependencies

```bash
npm install
```

## 2. (Optional) Add OpenAI API key

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_api_key_here
```

LLM enrichment is optional.
The application works without an API key using fallback extraction.

## 3. Run development server

```bash
npm run dev
```

## 4. Production build

```bash
npm run build
npm start
```

---

# 🧪 How to Use This Project

## 📋 Quick Start Guide

### Step 1: Define Your Investment Thesis
1. Navigate to the **Dashboard** (homepage)
2. Enter your investment thesis in the text area
3. Example: *"We're looking for early-stage AI infrastructure companies with strong technical teams and enterprise focus"*

### Step 2: Browse and Score Companies
1. Go to **Companies** page
2. View automatically scored companies (0-100 scale)
3. Scores update in real-time based on your thesis
4. Filter by industry, stage, or minimum score

### Step 3: Enrich Company Data
1. Click on any company to view details
2. Click **"Enrich Data"** button
3. System fetches website content and extracts:
   - Company summary
   - Key business activities
   - Relevant keywords
   - Investment signals

### Step 4: Organize Your Pipeline
1. **Add to Lists**: Create custom lists for different investment stages
2. **Save Searches**: Save your filtered views for quick access
3. **Track Progress**: Monitor how companies align with your thesis over time

## 🔄 Workflow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Companies      │    │  Company Detail │
│                │    │                  │    │                │
│ • Set Thesis   │───▶│ • View Scores    │───▶│ • Enrich Data  │
│ • Overview     │    │ • Filter/Sort   │    │ • Add to List  │
│ • Top Matches  │    │ • Save Search   │    │ • View Signals │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Saved Searches │              │
         │              │                │              │
         └──────────────▶│ • Re-run Search │◀─────────────┘
                        │ • Track Metrics │
                        │ • Delete/Copy   │
                        └─────────────────┘
```

## 🎯 Typical VC Workflow

### Phase 1: Thesis Definition
```
Dashboard → Enter Thesis → System Extracts Keywords → Scoring Model Ready
```

### Phase 2: Company Discovery
```
Companies Page → View Scores → Apply Filters → Identify High-Scoring Targets
```

### Phase 3: Deep Analysis
```
Company Detail → Enrich Data → Review Signals → Add to Investment List
```

### Phase 4: Pipeline Management
```
Lists Page → Organize by Stage → Saved Searches → Monitor Over Time
```

## 📊 Understanding the Scoring System

### Score Breakdown
- **🟢 Strong Fit (70-100)**: High thesis alignment, multiple keyword matches
- **🟡 Moderate Fit (40-69)**: Partial alignment, some keyword matches
- **🔴 Weak Fit (0-39)**: Low alignment, minimal matches

### Score Components
```
Base Score: 10
+ Industry Match: +15 (if matches thesis industry)
+ Stage Match: +10 (if matches investment stage)
+ Keywords: +10 each (max 50)
+ Signals: +5 each (max 25)
─────────────────────────────
Maximum: 100
```

## 💡 Pro Tips

### For Better Thesis Matching
- Use specific industry terms
- Include target stages (Seed, Series A, etc.)
- Mention key technologies or business models
- Add geographical preferences if relevant

### For Efficient Sourcing
- Save searches for different investment theses
- Use score filters to focus on best matches
- Create lists for different deal stages
- Regularly update thesis as strategy evolves

### For Signal Analysis
- Look for funding announcements
- Check hiring patterns
- Identify enterprise customers
- Monitor technical indicators

---

# 📊 Design Tradeoffs

### Why LocalStorage?

**Pros:**
* No backend/database setup
* Instant performance
* Simple MVP deployment

**Cons:**
* Single-device persistence
* Not collaborative

### Why LLM + Fallback?

**Pros:**
* High-quality extraction when available
* Reliability without API key
* Cost control

**Cons:**
* Variable output quality
* External dependency (optional)

### Why Deterministic Scoring?

**Pros:**
* Transparent logic
* No black-box recommendations
* Recruiter-friendly evaluation

**Cons:**
* Simpler than full ML ranking

---

# 🎓 What This Demonstrates

* Thesis-driven sourcing logic
* Explainable scoring systems
* Production-safe error handling
* Performance optimization
* Deterministic matching models
* Structured enrichment architecture

---

# 🚀 Final Summary

Precision AI Scout transforms company sourcing into:

* Structured analysis
* Deterministic scoring
* Explainable matching
* Signal-based evaluation

The system provides venture capitalists with a transparent, efficient way to evaluate investment opportunities based on their specific investment criteria, moving beyond simple keyword matching to sophisticated, explainable investment intelligence.