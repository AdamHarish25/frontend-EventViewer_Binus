// src/services/authService.js
import apiClient from './api';

/**
 * Fungsi untuk melakukan login.
 * Menggunakan endpoint: POST /auth/login
 */
const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Backend sekarang mengirim lebih banyak data user
    if (response.data.accessToken) {
      // Simpan seluruh data yang diterima dari backend
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
    const response = await apiClient.post('/auth/register', registrationData);
    return response.data;
  } catch (error) {
    console.error("Registration Error:", error.response?.data || error.message);
    throw error;
  }
};

const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error("Logout API call failed, but proceeding with client-side logout.", error);
  } finally {
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

// --- TAMBAHAN: FUNGSI UNTUK RESET PASSWORD ---

/**
 * Meminta OTP untuk reset password.
 * Menggunakan endpoint: POST /password/forgot-password
 */
const forgotPassword = async (email) => {
  try {
    console.log('Sending forgot password request for email:', email);
    const response = await apiClient.post('/password/forgot-password', { email });
    console.log('Forgot password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Handle different types of errors
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.response?.status === 404) {
      throw { message: 'Email tidak ditemukan dalam database. Pastikan email sudah terdaftar.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Silakan coba lagi nanti.' };
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw { message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' };
    } else {
      throw { message: error.message || 'Gagal mengirim OTP. Silakan coba lagi.' };
    }
  }
};

/**
 * Memverifikasi OTP yang diterima.
 * Menggunakan endpoint: POST /password/verify-otp
 */
const verifyOtp = async (email, otp) => {
  try {
    console.log('Verifying OTP for email:', email, 'OTP:', otp);
    const response = await apiClient.post('/password/verify-otp', { email, otp });
    console.log('Verify OTP response:', response.data);
    return response.data; // Akan mengembalikan resetToken
  } catch (error) {
    console.error('Verify OTP error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Handle different types of errors
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.response?.status === 400) {
      throw { message: 'OTP tidak valid atau sudah expired. Silakan minta OTP baru.' };
    } else if (error.response?.status === 404) {
      throw { message: 'Email tidak ditemukan. Silakan coba lagi.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Silakan coba lagi nanti.' };
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw { message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' };
    } else {
      throw { message: error.message || 'Gagal memverifikasi OTP. Silakan coba lagi.' };
    }
  }
};

/**
 * Mengatur ulang password dengan token.
 * Menggunakan endpoint: POST /password/reset-password
 */
const resetPassword = async (email, password, resetToken) => {
  try {
    console.log('Resetting password for email:', email, 'with token:', resetToken);
    const response = await apiClient.post('/password/reset-password', { email, password, resetToken });
    console.log('Reset password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Handle different types of errors
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.response?.status === 400) {
      throw { message: 'Token tidak valid atau sudah expired. Silakan minta OTP baru.' };
    } else if (error.response?.status === 404) {
      throw { message: 'Email tidak ditemukan. Silakan coba lagi.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Silakan coba lagi nanti.' };
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw { message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' };
    } else {
      throw { message: error.message || 'Gagal reset password. Silakan coba lagi.' };
    }
  }
};


// --- Helper Functions (Tidak ada perubahan) ---
const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

const isAuthenticated = () => {
  return !!getCurrentUser();
};

const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

const isAdmin = () => {
  return getUserRole() === 'admin';
};

const isSuperAdmin = () => {
  return getUserRole() === 'super_admin';
};

const authService = {
  login,
  register,
  logout,
  forgotPassword, // <-- Tambahkan
  verifyOtp,      // <-- Tambahkan
  resetPassword,  // <-- Tambahkan
  getCurrentUser,
  isAuthenticated,
  getUserRole,
  isAdmin,
  isSuperAdmin,
};

export default authService;