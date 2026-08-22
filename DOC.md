# SmartDesk - Hackathon Documentation

## 1. What We Built & How It Works

**SmartDesk** is an AI-powered customer support ticket routing and prioritization system designed to eliminate manual triage. When a customer submits a support ticket, the system analyzes it in real-time (under 2 seconds) to determine the issue category, urgency/priority, root cause, and even suggests an automated reply.

### How it Works:
1. **Input:** The user pastes text or uploads a bulk CSV file containing support tickets into the React dashboard.
2. **Preprocessing:** The Flask backend cleans the text (removing mentions, URLs, special characters).
3. **Hybrid NLP Pipeline:**
   - **Category Classification:** Handled by a fine-tuned transformer model (DistilBERT) to capture deep semantic meaning.
   - **Priority & Root Cause Detection:** Handled by highly efficient, lightweight models (TF-IDF + Logistic Regression) for lightning-fast inference.
4. **Output & Storage:** The results, along with confidence scores, are displayed on the frontend. Processed tickets are stored in a SQLite database for history tracking and analytics.
5. **Feedback Loop:** Support agents can provide feedback to correct the AI's predictions, which is then used to actively retrain the lightweight models over time.

---

## 2. Our Contribution & Work Done

> **[📝 NOTE FOR YOU: Edit this section to highlight exactly what you worked on!]**

- Designed and implemented the full-stack architecture (React frontend + Flask API).
- Processed and curated the training data using the Twitter US Airline Sentiment dataset (30,000 samples).
- Trained and integrated the machine learning models (DistilBERT and Logistic Regression pipelines).
- Built the interactive, glassmorphism-styled frontend dashboard featuring real-time data visualization (Recharts).
- Implemented the bulk CSV upload feature and the active-learning feedback loop.

---

## 3. Team Members & Roles

> **[📝 NOTE FOR YOU: If you worked alone, you can change this to "Solo Developer" and remove the list. If you had a team, fill in their names and roles below.]**

- **[Your Name]** - *Full Stack Engineer / ML Developer*: Handled backend API architecture, frontend dashboard development, and model training/integration.
- **[Team Member 2 Name]** - *[Role, e.g., Data Engineer / UI Designer]*: [Describe their contribution].
- **[Team Member 3 Name]** - *[Role]*: [Describe their contribution].

---

## 4. Key Features

- **Real-Time Analysis:** Sub-2-second inference for single tickets.
- **Bulk Processing:** Capability to upload and analyze CSVs with hundreds of tickets simultaneously.
- **Analytics Dashboard:** Visual insights into ticket volume, category distribution, and average response times.
- **Multi-Model Intelligence:** Combining heavy-weight transformers with lightweight statistical models.
- **Agent Feedback Loop:** A dedicated review system that allows human agents to override AI decisions and seamlessly trigger model retraining.

---

## 5. Technical Decisions

- **Why a Hybrid NLP Approach?** 
  Relying solely on massive LLMs (like GPT-4) for thousands of tickets is expensive and slow. We chose DistilBERT for category classification because it requires semantic understanding, but we opted for TF-IDF + Logistic Regression for priority and root cause because they are fast, highly interpretable, and incredibly efficient for sparse text features.
- **Decoupled Architecture:** 
  We separated the React frontend from the Flask backend. This allows the heavy Python ML inference to scale independently from the UI serving.
- **SQLite Database:** 
  Chosen for its zero-configuration simplicity, allowing the project to easily run locally or in a lightweight container during the hackathon.

---

## 6. Challenges We Faced

> **[📝 NOTE FOR YOU: Pick and edit the challenges that sound the most relevant to your hackathon experience!]**

- **Handling Noisy Data:** The training data (based on tweets/complaints) was incredibly noisy. Writing robust preprocessing pipelines to clean out URLs, emojis, and weird formatting without losing the core context was a major hurdle.
- **Inference Speed vs. Accuracy:** Loading DistilBERT models in memory initially caused lag on the Flask endpoints. We had to optimize the model loading process (loading it once at startup) to ensure the API responded in under 2 seconds.
- **UI State Management:** Handling the asynchronous state of bulk CSV uploads and rendering the charts dynamically on the dashboard required careful React hook management to avoid freezing the browser.
