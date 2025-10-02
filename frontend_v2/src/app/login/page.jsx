'use client'
import axios from "axios";
import { useState } from "react";

export default function Home() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      /* console.log("Attempting to connect to backend...");
      console.log("Sending data:", { email, password, name }); */
      
      // Try to connect to backend if available
      const response = await axios.post("https://samanyay-v2-backend.onrender.com/api/register", { 
        email, 
        password, 
        name 
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data.success) {
        console.log('Registration successful:', response.data);
        
        // Redirect to profile page
        window.location.href = 'http://localhost:3000/profile';
        
        // Or if using React Router:
        // navigate('/profile');
      }
      alert("Registration successful!");
      
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log("Backend server not running. This is a demo - form data would be sent to backend:");
        console.log("Form submitted:", { email, password, name });
        alert("Demo Mode: Backend server not running. In production, this data would be sent to the server.");
      } else if (error.code === 'ECONNABORTED') {
        console.log("Request timeout - backend might be slow to respond");
        alert("Request timeout. Backend server might be slow to respond.");
      } else if (error.response) {
        // Server responded with error status
        console.log("Server responded with error:", error.response.status, error.response.data);
        alert(`Server error: ${error.response.status} - ${error.response.data || 'Unknown error'}`);
      } else {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
      }
    }
  };

  ///api/auth/google

  // Handle Google login - static frontend only
  const handleGoogleLogin = async () => {

    try {

      window.location.href = 'https://samanyay-v2-backend.onrender.com/api/auth/google';
      
      /* const response = await axios.post("http://localhost:5000/api/auth/google", {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // 5 second timeout
      }); */
      
      /* if (response.data.success) {
        console.log('Registration successful:', response.data);
        
        // Redirect to profile page
        window.location.href = 'http://localhost:3000/profile';
        
        // Or if using React Router:
        // navigate('/profile');
      } */
      alert("Registration successful!");
      
    } catch (error) {
      console.error("Full error details:", error);
    }
    console.log("Google login clicked");
  };

  /* // Test backend connection
  const testBackend = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/test");
      console.log("Backend test successful:", response.data);
      alert("Backend is working! " + response.data.message);
    } catch (error) {
      console.error("Backend test failed:", error);
      alert("Backend test failed: " + error.message);
    }
  }; */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Main Container with Animation */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl px-30 py-15 ">

        {/* Logo Section with Animation */}
        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <div className="h-12 w-12 mb-3 transform transition-all duration-300 hover:scale-110">
            <img
              className="size-full object-contain"
              src="https://cdn-icons-png.flaticon.com/512/1/1430.png"
              loading="lazy"
              alt="Samanyay AI Logo"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Samanyay AI</h1>
          <p className="text-base text-gray-600 text-center">Welcome to Legal Intelligence</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              placeholder="Enter your Name"
              required
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Sign In
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </button>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Test Backend Button */}
          {/* <div className="text-center">
            <button
              type="button"
              onClick={testBackend}
              className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-300 hover:underline"
            >
              Test Backend Connection
            </button>
          </div> */}
        </form>

        {/* Premium Section */}
        <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="text-center">
            <h3 className="text-base font-semibold text-gray-800 mb-5">Wanna go Premium?</h3>
            <div className="flex justify-center items-center gap-4 mb-4">
              {/* Visa Card Icon */}
              <div className="flex cursor-pointer items-center justify-center w-12 h-5  rounded text-white font-bold text-xs ">
                <img src="https://www.citypng.com/public/uploads/preview/mastercard-visa-cards-logos-icons-701751695036083sdqsk5ncvn.png" alt="" />
              </div>
              {/* UPI Icon */}
              <div className="flex cursor-pointer items-center justify-center w-12 h-5 rounded text-white font-bold text-xs ">
                <img src="https://cdn.iconscout.com/icon/free/png-256/free-upi-logo-icon-svg-download-png-1747946.png?f=webp" alt="" />
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center space-x-6 text-sm">
            <button className="text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:underline">
              Terms of Service
            </button>
            <button className="text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:underline">
              Privacy Policy
            </button>
            <button className="text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:underline">
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .max-w-md {
            max-width: 100%;
            margin: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
}
