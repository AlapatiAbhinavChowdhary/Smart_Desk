import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Analyze a support ticket.
 * @param {string} text — the raw ticket text
 * @returns {Promise<object>} — analysis result
 */
export async function analyzeTicket(text) {
  const { data } = await api.post('/analyze', { text });
  return data;
}

/**
 * Fetch dashboard stats.
 * @returns {Promise<object>}
 */
export async function getStats() {
  const { data } = await api.get('/stats');
  return data;
}

/**
 * Health check.
 * @returns {Promise<object>}
 */
export async function healthCheck() {
  const { data } = await api.get('/health');
  return data;
}

/**
 * Bulk analyze tickets from CSV.
 * @param {File} file - the CSV file
 * @returns {Promise<object>} - results and stats
 */
export async function analyzeBulk(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/analyze/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 minutes for bulk processing
  });
  return data;
}

/**
 * Submit feedback to correct AI prediction.
 * @param {object} feedbackData - { ticket_id, corrected_category, corrected_priority }
 * @returns {Promise<object>}
 */
export async function submitFeedback(feedbackData) {
  const { data } = await api.post('/feedback', feedbackData);
  return data;
}

export default api;
