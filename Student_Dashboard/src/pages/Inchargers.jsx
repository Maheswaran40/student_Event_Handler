import React, { useEffect, useState } from "react";
import { userService } from "../services/api";
import { BsCalendarEventFill } from "react-icons/bs";
function Inchargers() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  console.log("currentUser", currentUser);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      // Get current user profile
      const profile = await userService.getUserProfile();

      if (!profile.success) {
        setError(profile.error || "Failed to load user profile");
        setLoading(false);
        return;
      }
      console.log("setCurrentUser", profile.data.data);
      const user = profile.data.data.user;
      setCurrentUser(user);

      // If admin, fetch all users
      if (user.role == "admin") {
        const allUsers = await userService.getAllUsers();
        console.log("All users:", allUsers);

        if (allUsers.success) {
          // Filter out the current admin if needed, or keep all users
          setUsers(allUsers.users);
        } else {
          setError("Failed to load users");
        }
      } else {
        // For volunteers, just show their own data
        setUsers([user]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (userId, updatedData) => {
    try {
      const result = await userService.updateUser(userId, updatedData);
      if (result.success) {
        await fetchData();
        setEditingUser(null);
        alert("User updated successfully!");
      } else {
        alert(`Update failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const result = await userService.deleteUser(userId);
      if (result.success) {
        await fetchData();
        setShowDeleteConfirm(null);
        alert("User deleted successfully!");
      } else {
        alert(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error: {error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              User Management Dashboard
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold">Logged in as:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser?.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {currentUser?.role?.toUpperCase()}
              </span>
              <span>({currentUser?.name})</span>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Total Users:{" "}
              <span className="font-semibold text-gray-700">
                {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* Users Cards Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentUser?.role === "admin" ? "All Users" : "Your Profile"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, index) => (
              <UserCard
                key={user._id || user.id || index}
                user={user}
                currentUser={currentUser}
                onEdit={() => setEditingUser(user)}
                onDelete={() => setShowDeleteConfirm(user._id || user.id)}
                showDeleteConfirm={showDeleteConfirm === (user._id || user.id)}
                onConfirmDelete={handleDelete}
                onCancelDelete={() => setShowDeleteConfirm(null)}
              />
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onSave={handleUpdate}
            onClose={() => setEditingUser(null)}
          />
        )}
      </div>
    </div>
  );
}

// User Card Component
function UserCard({
  user,
  currentUser,
  onEdit,
  onDelete,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-blue-100 text-sm mt-1">{user.email}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === "admin"
                ? "bg-purple-200 text-purple-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm">
              ID: {(user._id || user.id)?.slice(-8)}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">{user.email}</span>
          </div>
          {user.eventRoles.map((event, index) => (
            <div key={index} className="text-sm text-gray-600">
              <b className="flex items-center"><BsCalendarEventFill /> &nbsp;&nbsp;{event.title}</b>
            </div>
          ))}

          {user.students && user.students.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              {showDetails ? "▼" : "▶"} Show Students ({user.students.length})
            </button>
          )}

          {showDetails && user.students && user.students.length > 0 && (
            <div className="mt-3 pl-3 border-l-2 border-blue-300">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Allocated Students:
              </p>
              <div className="space-y-1">
                {user.students.map((student, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    • {student.name || `Student ${idx + 1}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer - Actions (only for admin) */}
      {currentUser?.role === "admin" && currentUser._id !== user._id && (
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={onEdit}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onConfirmDelete(user._id || user.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              >
                Confirm
              </button>
              <button
                onClick={onCancelDelete}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    password: "",
    role: user.role || "volunteer",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (!dataToSend.password) delete dataToSend.password;
    onSave(user._id || user.id, dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (optional)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Leave blank to keep current"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Inchargers;
