import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiUser, FiCalendar, FiHome, FiShield } from "react-icons/fi";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when an option is selected
  const handleOptionSelect = (option) => {
    // Handle your option logic here
    console.log('Selected:', option);
    setIsOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FiCalendar className="text-primary-600 text-2xl" />
            <span className="font-bold text-xl text-gray-800">EventHub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiHome />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/events"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiCalendar />
              <span>Events</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <FiShield />
                <span>Admin</span>
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiUser />
              <span>Profile</span>
            </Link>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden  p-2 bg-blue-500 text-white rounded-md"
          >
            ☰ Menu
          </button>
          {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:transform-none lg:hidden lg:w-auto lg:flex-1 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b flex justify-between items-center lg:hidden">
          <h2 className="font-bold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <Sidebar onOptionSelect={handleOptionSelect} />
      </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="text-sm text-gray-600 hidden sm:flex">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
