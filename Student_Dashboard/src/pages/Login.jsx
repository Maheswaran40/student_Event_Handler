import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoginImg from "../assets/images/eventLogin.jpg";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

    const API_URL = "https://ilife-event-handler-backend.onrender.com"
  //   const API_URL =
  // import.meta.env.VITE_BASE_URL || import.meta.env.VITE_LOCAL_BASE_URL
  // ;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };
  console.log(email, password, handleSubmit);
  // In your login component
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Set default axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Redirect based on role
        if (userData.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Login failed");
    }
  };
  return (
   <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary-50 to-blue-100">
  <div className="grid grid-cols-1 lg:grid-cols-2  w-[1000px]">
     {/* Left Side - Image */}
  <div className="hidden lg:flex justify-center items-center  p-8">
    <img
      src={LoginImg}
      alt="Login"
      className="h-[480px] w-[500px] object-cover rounded-2xl shadow-2xl animate-fade-in"
    />
  </div>

  {/* Right Side - Login Form */}
  <div className="flex justify-center items-center  p-6 lg:p-10">
    <div className="bg-white rounded-2xl shadow-2xl   w-full max-w-md p-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <FiLogIn className="text-primary-600 text-2xl" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800">
          Welcome Back
        </h2>

        <p className="text-gray-600 mt-2">
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>

          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10 w-full"
              placeholder="admin@example.com or user@example.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 w-full"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  </div>
  </div>
</div>
  );
};

export default Login;
