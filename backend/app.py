"""
SmartDesk Backend — AI-Powered Customer Support Ticket Routing System
Flask API serving DistilBERT (category), TF-IDF+LR (priority & root cause),
and rule-based auto-reply generation.
"""

import os
import json
import time
import re
import csv
import io
from datetime import datetime, timezone

# Database wrapper
import database

import torch
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

# ---------------------------------------------------------------------------
# App & CORS
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ---------------------------------------------------------------------------
# Load models once at startup
# ---------------------------------------------------------------------------
print("[SmartDesk] Loading models ...")

# 1. DistilBERT — category classification
_bert_tokenizer = DistilBertTokenizerFast.from_pretrained(
    os.path.join(MODELS_DIR, "bert_tokenizer")
)
_bert_model = DistilBertForSequenceClassification.from_pretrained(
    os.path.join(MODELS_DIR, "bert_model")
)
# Dynamic quantization: reduces RAM by ~70% so it fits in free 512MB tiers
_bert_model = torch.quantization.quantize_dynamic(
    _bert_model, {torch.nn.Linear}, dtype=torch.qint8
)
_bert_model.eval()

with open(os.path.join(MODELS_DIR, "label_mapping.json"), "r") as f:
    _label_mapping = json.load(f)
_id2label = _label_mapping["id2label"]

# 2. TF-IDF + Logistic Regression — priority detection
_priority_vectorizer = joblib.load(os.path.join(MODELS_DIR, "priority_vectorizer.pkl"))
_priority_model = joblib.load(os.path.join(MODELS_DIR, "priority_model.pkl"))

# 3. TF-IDF + Logistic Regression — root cause detection
_rc_vectorizer = joblib.load(os.path.join(MODELS_DIR, "rc_vectorizer.pkl"))
_rc_model = joblib.load(os.path.join(MODELS_DIR, "rc_model.pkl"))

print("[SmartDesk] All models loaded successfully [OK]")

print("[SmartDesk] All models loaded successfully [OK]")

# Initialize database
database.init_db()

# ---------------------------------------------------------------------------
# Auto-reply templates  (rule-based)
# ---------------------------------------------------------------------------
_AUTO_REPLIES: dict[str, dict[str, str]] = {
    "Billing": {
        "Urgent": (
            "We sincerely apologize for the billing issue you're experiencing. "
            "This has been escalated to our billing team as an urgent matter. "
            "A specialist will contact you within 1 hour to resolve this. "
            "Your reference ID has been generated for priority tracking."
        ),
        "High": (
            "Thank you for reaching out about your billing concern. "
            "We understand how important this is and have flagged it as high priority. "
            "Our billing department will review your case within 4 hours. "
            "We'll keep you updated on the progress."
        ),
        "Medium": (
            "We've received your billing inquiry and appreciate your patience. "
            "Our team will review the details and get back to you within 24 hours. "
            "In the meantime, you can check your billing history in your account settings."
        ),
        "Low": (
            "Thank you for your billing question. "
            "We've logged your inquiry and our team will address it during regular business hours. "
            "For immediate billing information, please visit your account dashboard."
        ),
    },
    "Technical": {
        "Urgent": (
            "We're aware of the technical issue you've reported and treat this with highest urgency. "
            "Our engineering team has been immediately notified and is investigating. "
            "We expect to have an update for you within 30 minutes. "
            "We apologize for any disruption to your service."
        ),
        "High": (
            "Thank you for reporting this technical issue. "
            "We've assigned a senior engineer to investigate your case with high priority. "
            "You can expect a resolution or update within 4 hours. "
            "Please don't hesitate to share any additional details that may help."
        ),
        "Medium": (
            "We've received your technical support request. "
            "Our technical team will look into this and provide a solution within 24 hours. "
            "In the meantime, you may find helpful resources in our knowledge base."
        ),
        "Low": (
            "Thank you for reaching out about this technical matter. "
            "We've added it to our support queue and will address it shortly. "
            "For common solutions, please check our FAQ section."
        ),
    },
    "Delivery": {
        "Urgent": (
            "We understand the urgency regarding your delivery and sincerely apologize for the inconvenience. "
            "We've immediately escalated this to our logistics team. "
            "A delivery coordinator will contact you within 1 hour with a resolution. "
            "Your satisfaction is our top priority."
        ),
        "High": (
            "We're sorry to hear about the delivery issue. "
            "This has been flagged as high priority and our logistics team is actively working on it. "
            "You'll receive an update with tracking details within 4 hours."
        ),
        "Medium": (
            "Thank you for letting us know about your delivery concern. "
            "We're looking into the status of your shipment and will provide an update within 24 hours. "
            "You can also track your delivery using the tracking link in your confirmation email."
        ),
        "Low": (
            "We've noted your delivery inquiry. "
            "Our team will verify the delivery details and respond within 1-2 business days. "
            "For immediate tracking, please use the tracking number provided in your order confirmation."
        ),
    },
    "Booking": {
        "Urgent": (
            "We understand your booking requires immediate attention. "
            "Our reservations team has been alerted and will reach out within 1 hour. "
            "If your booking is for today, please call our priority line for fastest service. "
            "We're committed to resolving this immediately."
        ),
        "High": (
            "Thank you for contacting us about your booking. "
            "We've prioritized your request and our booking team will assist you within 4 hours. "
            "Rest assured, we'll do everything possible to accommodate your needs."
        ),
        "Medium": (
            "We've received your booking request and will process it within 24 hours. "
            "Our team will confirm the details and send you an updated confirmation. "
            "Thank you for your patience."
        ),
        "Low": (
            "Thank you for your booking inquiry. "
            "We'll review the details and get back to you within 1-2 business days. "
            "For immediate booking modifications, please visit your account portal."
        ),
    },
    "Complaint": {
        "Urgent": (
            "We are truly sorry for the experience you've had. "
            "Your complaint has been escalated to senior management for immediate review. "
            "A dedicated resolution specialist will contact you within 1 hour. "
            "We take your feedback very seriously and are committed to making this right."
        ),
        "High": (
            "We sincerely apologize for the inconvenience you've experienced. "
            "Your feedback is extremely valuable and has been escalated for priority review. "
            "A member of our customer success team will reach out within 4 hours to resolve this."
        ),
        "Medium": (
            "We're sorry to hear about your experience and appreciate you sharing this feedback. "
            "Our quality assurance team will review your complaint within 24 hours. "
            "We're committed to improving our service based on your input."
        ),
        "Low": (
            "Thank you for your feedback. We value every customer's experience. "
            "Your comments have been logged and will be reviewed by our improvement team. "
            "We're always working to provide better service."
        ),
    },
    "Positive": {
        "Urgent": (
            "Wow, thank you so much for your wonderful feedback! "
            "It truly means the world to our team. We're thrilled to hear about your positive experience. "
            "We'll make sure to share your kind words with the team members involved. "
            "Thank you for being a valued customer!"
        ),
        "High": (
            "Thank you for taking the time to share your positive experience! "
            "Your feedback motivates our entire team to keep delivering excellence. "
            "We look forward to continuing to exceed your expectations."
        ),
        "Medium": (
            "We really appreciate your kind words! "
            "It's great to know we're meeting your expectations. "
            "Thank you for choosing our service — we're here whenever you need us."
        ),
        "Low": (
            "Thank you for your feedback! We're glad you had a good experience. "
            "Your satisfaction is what drives us. Looking forward to serving you again!"
        ),
    },
}

# ---------------------------------------------------------------------------
# Helper: clean text
# ---------------------------------------------------------------------------
def _clean_text(text: str) -> str:
    """Basic text cleaning: lowercase, strip handles & URLs."""
    text = text.strip()
    text = re.sub(r"@\w+", "", text)           # remove @mentions
    text = re.sub(r"http\S+", "", text)         # remove URLs
    text = re.sub(r"\s+", " ", text).strip()    # collapse whitespace
    return text

# ---------------------------------------------------------------------------
# Prediction helpers
# ---------------------------------------------------------------------------
def _predict_category(text: str) -> tuple[str, float]:
    """Return (category_label, confidence) using DistilBERT."""
    inputs = _bert_tokenizer(
        text, return_tensors="pt", truncation=True,
        padding=True, max_length=128
    )
    with torch.no_grad():
        logits = _bert_model(**inputs).logits
    probs = torch.nn.functional.softmax(logits, dim=-1)[0]
    pred_id = torch.argmax(probs).item()
    confidence = probs[pred_id].item()
    label = _id2label[str(pred_id)]
    return label, round(confidence * 100, 2)


def _predict_priority(text: str) -> tuple[str, float]:
    """Return (priority_label, confidence) using TF-IDF + LR."""
    vec = _priority_vectorizer.transform([text])
    pred = _priority_model.predict(vec)[0]
    proba = _priority_model.predict_proba(vec)[0]
    confidence = max(proba) * 100
    return pred, round(confidence, 2)


def _predict_root_cause(text: str) -> tuple[str, float]:
    """Return (root_cause_label, confidence) using TF-IDF + LR."""
    vec = _rc_vectorizer.transform([text])
    pred = _rc_model.predict(vec)[0]
    proba = _rc_model.predict_proba(vec)[0]
    confidence = max(proba) * 100
    return pred, round(confidence, 2)


def _generate_reply(category: str, priority: str) -> str:
    """Rule-based auto-reply selection."""
    cat_replies = _AUTO_REPLIES.get(category, _AUTO_REPLIES["Complaint"])
    return cat_replies.get(priority, cat_replies["Medium"])

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "models_loaded": True, "timestamp": datetime.now(timezone.utc).isoformat()})


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)
    if not data or not data.get("text", "").strip():
        return jsonify({"error": "Please provide a 'text' field with the ticket content."}), 400

    raw_text = data["text"].strip()
    cleaned = _clean_text(raw_text)

    if len(cleaned) < 5:
        return jsonify({"error": "Ticket text is too short. Please provide more detail."}), 400

    start = time.time()

    category, cat_conf = _predict_category(cleaned)
    priority, pri_conf = _predict_priority(cleaned)
    root_cause, rc_conf = _predict_root_cause(cleaned)
    auto_reply = _generate_reply(category, priority)

    elapsed = round(time.time() - start, 3)

    # Update analytics
    # (Removed memory updates - handled by DB)

    result = {
        "ticket_text": raw_text,
        "category": {"label": category, "confidence": cat_conf},
        "priority": {"label": priority, "confidence": pri_conf},
        "root_cause": {"label": root_cause, "confidence": rc_conf},
        "auto_reply": auto_reply,
        "response_time_ms": int(elapsed * 1000),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # Save to database and append returned ID
    ticket_id = database.insert_ticket(result)
    result["id"] = ticket_id

    return jsonify(result)


@app.route("/analyze/bulk", methods=["POST"])
def analyze_bulk():

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        # Read file as string
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(stream)

        # Detect text column
        text_col = None
        if reader.fieldnames:
            lower_fields = {f.lower(): f for f in reader.fieldnames if f}
            for candidate in ['text', 'ticket', 'message', 'description', 'content', 'tweet']:
                if candidate in lower_fields:
                    text_col = lower_fields[candidate]
                    break
            
            # Fallback to first column if no known name matches
            if not text_col and len(reader.fieldnames) > 0:
                text_col = reader.fieldnames[0]

        if not text_col:
            return jsonify({"error": "Could not determine which column contains the ticket text."}), 400

        results = []
        db_records = []
        start = time.time()
        
        # Limit rows to prevent timeout if necessary, but for now process all
        for row in reader:
            raw_text = row.get(text_col, "")
            if not raw_text or not raw_text.strip():
                continue

            cleaned = _clean_text(raw_text)
            if len(cleaned) < 5:
                row['Predicted_Category'] = "N/A"
                row['Predicted_Priority'] = "N/A"
                row['Predicted_RootCause'] = "N/A"
                row['Auto_Reply'] = "Text too short"
                results.append(row)
                continue

            category, cat_conf = _predict_category(cleaned)
            priority, pri_conf = _predict_priority(cleaned)
            root_cause, rc_conf = _predict_root_cause(cleaned)
            auto_reply = _generate_reply(category, priority)

            # (Removed memory updates - handled by DB)
            
            results.append(row)

            # Collect for bulk DB insert
            db_records.append({
                "ticket_text": raw_text,
                "category": {"label": category, "confidence": cat_conf},
                "priority": {"label": priority, "confidence": pri_conf},
                "root_cause": {"label": root_cause, "confidence": rc_conf},
                "auto_reply": auto_reply,
                "response_time_ms": 0,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

        # Insert all processed tickets into database
        if db_records:
            database.insert_bulk_tickets(db_records)

        elapsed = round(time.time() - start, 3)

        return jsonify({
            "status": "success",
            "processed_count": len(results),
            "response_time_ms": int(elapsed * 1000),
            "results": results
        })

    except Exception as e:
        return jsonify({"error": f"Error processing CSV file: {str(e)}"}), 500


@app.route("/stats", methods=["GET"])
def stats():
    total_analyzed, cat_dist, pri_dist = database.get_stats()
    recent_tickets = database.get_recent_tickets(limit=20)
    
    return jsonify({
        "total_analyzed": total_analyzed,
        "category_distribution": cat_dist,
        "priority_distribution": pri_dist,
        "recent_tickets": recent_tickets,
    })

@app.route("/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()
    if not data or 'ticket_id' not in data:
        return jsonify({"error": "Missing ticket_id"}), 400
        
    ticket_id = data['ticket_id']
    corrected_category = data.get('corrected_category')
    corrected_priority = data.get('corrected_priority')
    
    try:
        database.save_feedback(ticket_id, corrected_category, corrected_priority)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
