import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use(async (config) => {
    // Check if we're in guest mode (stored in localStorage for persistence across reloads)
    const isGuestMode = localStorage.getItem('vemakin_guest_mode') === 'true';
    
    // Debug logging
    console.log(`[API] Request to ${config.url} - Guest mode: ${isGuestMode}`);
    
    if (isGuestMode) {
        // Guest mode: send special header to backend
        config.headers['X-Guest-Mode'] = 'true';
        console.log(`[API] Adding X-Guest-Mode header to ${config.url}`);
        // No Firebase token needed for guest mode
        return config;
    }
    
    // Normal mode: add Firebase auth token
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
