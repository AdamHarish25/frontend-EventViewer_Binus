// src/services/authService.js
import apiClient from './api';

/**
 * Fungsi untuk melakukan login.
 * Menggunakan endpoint: POST /auth/login
 */
const login = async (email, password) => {
  try {
    // Endpoint sudah dikonfirmasi: /auth/login
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Tanyakan juga nama properti token di response, kita asumsikan 'accessToken'
    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};


const register = async (registrationData) => {
  try {
    // Panggil endpoint register dengan data pengguna
    const response = await apiClient.post('/auth/register', registrationData);
    return response.data;
  } catch (error) {
    console.error("Registration Error:", error.response?.data || error.message);
    throw error;
  }
};


/**
 * Fungsi untuk logout.
 * Menggunakan endpoint: POST /auth/logout
 */
const logout = async () => {
  try {
    // Panggil endpoint logout di backend (ini akan memvalidasi token yang ada)
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Abaikan error jika logout gagal (misal, token sudah expired), 
    // yang penting data di frontend bersih.
    console.error("Logout API call failed, but proceeding with client-side logout.", error);
  } finally {
    // Selalu hapus data user dari localStorage & redirect
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};


const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

// Helper: Cek apakah user sudah login
const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Helper: Ambil role user
const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// Helper: Cek apakah user admin
const isAdmin = () => {
  return getUserRole() === 'admin';
};

// Helper: Cek apakah user superadmin
const isSuperAdmin = () => {
  return getUserRole() === 'super_admin';
};



const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getUserRole,
  isAdmin,
  isSuperAdmin,
};

export default authService;
