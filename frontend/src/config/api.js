// API URL configuration
// Default to backend dev port 3004 (matches server `server.js` default)
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

// Ensure API_BASE_URL ends with '/api' so services always call the API prefix
if (!API_BASE_URL.endsWith('/api')) {
	// Trim trailing slash then append '/api'
	API_BASE_URL = API_BASE_URL.replace(/\/+$/,'') + '/api';
}

// Derive uploads base (strip trailing '/api' if present)
let UPLOADS_BASE = API_BASE_URL;
if (UPLOADS_BASE.endsWith('/api')) UPLOADS_BASE = UPLOADS_BASE.slice(0, -4);
// Cloudinary logo URL (set via Vite env VITE_CLOUDINARY_LOGO)
const CLOUDINARY_LOGO = import.meta.env.VITE_CLOUDINARY_LOGO || '/icon.svg';

export { API_BASE_URL, UPLOADS_BASE, CLOUDINARY_LOGO };
export default API_BASE_URL;
