// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000'; 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      // Pastikan nama properti token dari backend adalah 'accessToken'
      const token = JSON.parse(userString)?.accessToken; 
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;