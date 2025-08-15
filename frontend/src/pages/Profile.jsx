import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { apiRequest } from '../api';

const Profile = () => {
  const { user, loading, error, setError, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">You are not logged in.</div>;
  }

  const handleEdit = () => {
    setForm({ name: user.name, email: user.email, phone: user.phone || '' });
    setEditing(true);
    setError(null);
    setSuccess('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess('');
    try {
      await apiRequest('/users/me', 'PUT', form);
      await refreshUser();
      setSuccess('Profile updated!');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">My Profile</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>
        )}
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="flex-1 py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-gray-700">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Role:</span> {user.role}
            </div>
            {user.phone && (
              <div>
                <span className="font-semibold text-gray-700">Phone:</span> {user.phone}
              </div>
            )}
            <button
              className="mt-4 w-full py-2 px-4 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors"
              onClick={handleEdit}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 