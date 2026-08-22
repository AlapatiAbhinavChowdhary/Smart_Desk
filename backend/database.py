import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartdesk.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Tickets table
    c.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_text TEXT NOT NULL,
            predicted_category TEXT NOT NULL,
            category_confidence REAL NOT NULL,
            predicted_priority TEXT NOT NULL,
            priority_confidence REAL NOT NULL,
            predicted_root_cause TEXT NOT NULL,
            root_cause_confidence REAL NOT NULL,
            auto_reply TEXT NOT NULL,
            response_time_ms INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            is_corrected BOOLEAN DEFAULT 0
        )
    ''')

    # Feedback table for Active Learning
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER NOT NULL,
            corrected_category TEXT,
            corrected_priority TEXT,
            corrected_root_cause TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (ticket_id) REFERENCES tickets (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def insert_ticket(data):
    """Insert a new ticket and return its ID."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO tickets (
            ticket_text, predicted_category, category_confidence,
            predicted_priority, priority_confidence,
            predicted_root_cause, root_cause_confidence,
            auto_reply, response_time_ms, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['ticket_text'],
        data['category']['label'], data['category']['confidence'],
        data['priority']['label'], data['priority']['confidence'],
        data['root_cause']['label'], data['root_cause']['confidence'],
        data['auto_reply'], data['response_time_ms'], data['timestamp']
    ))
    ticket_id = c.lastrowid
    conn.commit()
    conn.close()
    return ticket_id

def insert_bulk_tickets(tickets_data):
    """Insert multiple tickets at once."""
    conn = get_db_connection()
    c = conn.cursor()
    
    records = [
        (
            t['ticket_text'],
            t['category']['label'], t['category']['confidence'],
            t['priority']['label'], t['priority']['confidence'],
            t['root_cause']['label'], t['root_cause']['confidence'],
            t['auto_reply'], t['response_time_ms'], t['timestamp']
        )
        for t in tickets_data
    ]
    
    c.executemany('''
        INSERT INTO tickets (
            ticket_text, predicted_category, category_confidence,
            predicted_priority, priority_confidence,
            predicted_root_cause, root_cause_confidence,
            auto_reply, response_time_ms, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', records)
    
    conn.commit()
    conn.close()

def get_recent_tickets(limit=20):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT t.*, f.corrected_category, f.corrected_priority 
        FROM tickets t
        LEFT JOIN feedback f ON t.id = f.ticket_id
        ORDER BY t.timestamp DESC LIMIT ?
    ''', (limit,))
    rows = c.fetchall()
    conn.close()
    
    # Format to match frontend expectations
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "ticket_text": row["ticket_text"],
            "category": {"label": row["predicted_category"], "confidence": row["category_confidence"]},
            "priority": {"label": row["predicted_priority"], "confidence": row["priority_confidence"]},
            "root_cause": {"label": row["predicted_root_cause"], "confidence": row["root_cause_confidence"]},
            "auto_reply": row["auto_reply"],
            "timestamp": row["timestamp"],
            "is_corrected": bool(row["is_corrected"]),
            "feedback": {
                "corrected_category": row["corrected_category"],
                "corrected_priority": row["corrected_priority"]
            } if row["is_corrected"] else None
        })
    return results

def get_stats():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) FROM tickets')
    total_analyzed = c.fetchone()[0]
    
    c.execute('SELECT predicted_category, COUNT(*) FROM tickets GROUP BY predicted_category')
    cat_dist = {row[0]: row[1] for row in c.fetchall()}
    
    c.execute('SELECT predicted_priority, COUNT(*) FROM tickets GROUP BY predicted_priority')
    pri_dist = {row[0]: row[1] for row in c.fetchall()}
    
    conn.close()
    
    # Ensure all categories exist even if 0
    categories = ["Billing", "Technical", "Delivery", "Booking", "Complaint", "Positive"]
    priorities = ["Urgent", "High", "Medium", "Low"]
    
    for cat in categories:
        if cat not in cat_dist:
            cat_dist[cat] = 0
            
    for pri in priorities:
        if pri not in pri_dist:
            pri_dist[pri] = 0
            
    return total_analyzed, cat_dist, pri_dist

def save_feedback(ticket_id, corrected_category, corrected_priority):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Update ticket flag
    c.execute('UPDATE tickets SET is_corrected = 1 WHERE id = ?', (ticket_id,))
    
    # Insert feedback
    timestamp = datetime.now(timezone.utc).isoformat()
    c.execute('''
        INSERT INTO feedback (ticket_id, corrected_category, corrected_priority, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (ticket_id, corrected_category, corrected_priority, timestamp))
    
    conn.commit()
    conn.close()
