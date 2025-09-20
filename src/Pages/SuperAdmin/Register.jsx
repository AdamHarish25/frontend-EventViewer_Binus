// src/Pages/RegisterUserPage.jsx
import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import authService from '../../services/authService';

import logo from '../../assets/logo.png';

const RegisterSuperAdminPage = () => {
  // State untuk semua field yang dibutuhkan oleh backend
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'super_admin', // Default role untuk registrasi publik
  });
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fungsi untuk menangani perubahan pada setiap input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      setError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);

    try {
      // Kirim semua field termasuk confirmPassword agar sinkron dengan validasi backend
      const response = await authService.register(formData);
      
      setSuccessMessage(response.message || 'Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login/superadmin');
      }, 2500);

    } catch (err) {
      const apiData = err.response?.data || {};
      const errorMessage = apiData.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      if (apiData.errorField && typeof apiData.errorField === 'object') {
        setFieldErrors(apiData.errorField);
      }
    } finally {
      setLoading(false);
    }
  };

  // ClassName dari kode Anda
  const className = {
    container: "background_home w-screen h-screen flex justify-center items-center relative",
    overlay: "absolute w-full h-full inset-y-0 inset-x-0 bg-[#B0D6F580]",
    formContainer: "bg-[#3F88BC] z-10 sm:w-fit md:w-96 lg:w-[600px] p-10 md:p-8 rounded-md text-white lg:absolute right-10 bottom-5",
    logoContainer: "text-center space-y-2 mb-4 ",
    logoText: "text-xs font-semibold ml-2",
    form: "space-y-4",
    inputGroup: "flex items-center bg-white rounded-md overflow-hidden",
    icon: "p-3 text-[#3F88BC]",
    separator: "w-px bg-[#3F88BC] h-10",
    input: "w-full p-3 text-gray-700 outline-none",
    button: "w-fit py-3 px-8 bg-blue-700 rounded-md hover:bg-blue-800 transition disabled:bg-blue-400",
    footer: "inset-x-0 text-center absolute bottom-0 bg-white",
    loginLink: "text-sm mt-4 text-center"
  };

  return (
    <div className={className.container}>
      <div className={className.overlay} />
      <div className={className.formContainer}>
        <div className="w-full flex items-center justify-end gap-5">
          <div className={className.logoContainer}>
            <img src={logo} alt="Logo Binus" className="h-20 w-fit" />
            <p className={className.logoText}>Event Viewer</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Create Super Admin Account</h1>
        <p className="text-sm mb-6">Join us! Fill in the details below to create your account.</p>

        <form className={className.form} onSubmit={handleSubmit}>
         {/* First Name */}
         <div className={className.inputGroup}>
            <div className={className.icon}><FaUser /></div>
            <div className={className.separator}></div>
            <input name="firstName" type="text" placeholder="First Name" className={className.input} value={formData.firstName} onChange={handleChange} required />
          </div>
          {fieldErrors.firstName && <p className="text-red-300 text-xs mt-1">{fieldErrors.firstName}</p>}
          
          {/* Last Name */}
          <div className={className.inputGroup}>
            <div className={className.icon}><FaUser /></div>
            <div className={className.separator}></div>
            <input name="lastName" type="text" placeholder="Last Name" className={className.input} value={formData.lastName} onChange={handleChange} required />
          </div>
          {fieldErrors.lastName && <p className="text-red-300 text-xs mt-1">{fieldErrors.lastName}</p>}
          
          {/* Email */}
          <div className={className.inputGroup}>
            <div className={className.icon}><FaEnvelope /></div>
            <div className={className.separator}></div>
            <input name="email" type="email" placeholder="Email (@binus.ac.id or @gmail.com)" className={className.input} value={formData.email} onChange={handleChange} required />
          </div>
          {fieldErrors.email && <p className="text-red-300 text-xs mt-1">{fieldErrors.email}</p>}
          
          {/* Password */}
          <div className={className.inputGroup}>
            <div className={className.icon}><FaLock /></div>
            <div className={className.separator}></div>
            <input name="password" type="password" placeholder="Password (min. 8 characters)" className={className.input} value={formData.password} onChange={handleChange} required />
          </div>
          {fieldErrors.password && <p className="text-red-300 text-xs mt-1">{fieldErrors.password}</p>}
       
          {/* Confirm Password */}
          <div className={className.inputGroup}>
            <div className={className.icon}><FaLock /></div>
            <div className={className.separator}></div>
            <input name="confirmPassword" type="password" placeholder="Confirm Password" className={className.input} value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          {fieldErrors.confirmPassword && <p className="text-red-300 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          
          {/* Role (disembunyikan, karena user publik diasumsikan sebagai 'student') */}
          <input name="role" type="hidden" value="student" />

          {error && <p className="text-red-300 text-sm">{error}</p>}
          {successMessage && <p className="text-green-300 text-sm">{successMessage}</p>}
          
          <div className="flex justify-between items-center">
            <button type="submit" className={className.button} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className={className.loginLink}>
            <p>Already have an account? <Link to="/login/superadmin" className="font-bold hover:underline">Login here</Link></p>
        </div>
      </div>

      <footer className={className.footer}>
        <h1 className="text-gray-600">Universitas Bina Nusantara Bekasi 2025</h1>
      </footer>
    </div>
  );
};

export default RegisterSuperAdminPage;