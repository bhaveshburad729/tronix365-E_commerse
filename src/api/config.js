export const getApiBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    console.log("API Base URL:", url);
    return url;
};

export const API_BASE_URL = getApiBaseUrl(); 
