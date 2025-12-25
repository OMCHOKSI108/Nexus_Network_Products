// API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Derive uploads base (strip trailing '/api' if present)
let UPLOADS_BASE = API_BASE_URL;
if (UPLOADS_BASE.endsWith('/api')) UPLOADS_BASE = UPLOADS_BASE.slice(0, -4);

export { API_BASE_URL, UPLOADS_BASE };
export default API_BASE_URL;
