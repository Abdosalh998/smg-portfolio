/**
 * The base URL for constructing image/upload paths.
 * 
 * When VITE_API_URL is set (e.g. "/api" in production), the base becomes ""
 * and image paths like "/uploads/about/file.webp" work as relative paths,
 * which are correctly proxied by Nginx.
 * 
 * When running locally (VITE_API_URL = "http://localhost:5000/api"),
 * the base becomes "http://localhost:5000" which is the correct dev URL.
 */
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';

export default BASE_URL;
