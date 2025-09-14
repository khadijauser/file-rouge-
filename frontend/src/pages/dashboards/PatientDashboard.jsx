import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api';
import { Calendar, Clock, User, Mail, Phone, FileText, Plus, Edit, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user, loading: authLoading, error: authError, setError: setAuthError, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');





  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/appointments');
        setAppointments(res.appointments || []);
      } catch (err) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  }, [user]);

  const now = new Date();
  const categorized = useMemo(() => {
    const result = { upcoming: [], past: [], completed: [], cancelled: [] };
    for (const appt of appointments) {
      const dt = new Date(`${appt.date}T${appt.time}`);
      if (appt.status === 'cancelled') result.cancelled.push(appt);
      else if (appt.status === 'completed') result.completed.push(appt);
      else if (!isNaN(dt) && dt >= now) result.upcoming.push(appt);
      else result.past.push(appt);
    }
    result.upcoming.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    result.past.sort((a,b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${b.time}`));
    return result;
  }, [appointments]);

  const nextAppointment = categorized.upcoming[0] || null;

  const handleProfileEdit = () => {
    setEditingProfile(true);
    setProfileSuccess('');
    setAuthError(null);
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setProfileSuccess('');
    setAuthError(null);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setAuthError(null);
    setProfileSuccess('');
    
    try {
      await apiRequest('/users/me', 'PUT', profileForm);
      await refreshUser();
      setProfileSuccess('Profile updated successfully!');
      setEditingProfile(false);
    } catch (err) {
      setAuthError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800';
      case 'pending': return 'bg-gradient-to-r from-medical-pink/20 to-medical-blue/20 text-medical-pink';
      case 'completed': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-medical-blue';
      case 'cancelled': return 'bg-gradient-to-r from-red-100 to-red-50 text-red-800';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your appointments and track your treatments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/book-appointment"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-medical-pink/30 hover:border-medical-pink hover:shadow-medical-pink/10 hover:-translate-y-1 duration-300 group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg mb-4 group-hover:from-pink-200 group-hover:to-blue-200 transition-all duration-300">
              <Plus className="w-6 h-6 text-medical-pink" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Book New Appointment</h3>
            <p className="text-gray-600">Schedule your next treatment</p>
          </Link>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-medical-pink/10 hover:-translate-y-1 duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg mb-4">
              <Calendar className="w-6 h-6 text-medical-blue" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent mb-2">Next Appointment</h3>
            {nextAppointment ? (
              <p className="text-gray-600">
                {new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.time}
              </p>
            ) : (
              <p className="text-gray-600">No upcoming appointments</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-medical-pink/10 hover:-translate-y-1 duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg mb-4">
              <FileText className="w-6 h-6 text-medical-pink" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent mb-2">Upcoming</h3>
            <p className="text-gray-600">{categorized.upcoming.length} scheduled</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'appointments'
                    ? 'border-medical-pink text-medical-pink'
                    : 'border-transparent text-gray-500 hover:text-medical-pink hover:border-medical-pink/30'
                }`}
              >
                Upcoming Appointments
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'history'
                    ? 'border-medical-pink text-medical-pink'
                    : 'border-transparent text-gray-500 hover:text-medical-pink hover:border-medical-pink/30'
                }`}
              >
                Treatment History
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'border-medical-pink text-medical-pink'
                    : 'border-transparent text-gray-500 hover:text-medical-pink hover:border-medical-pink/30'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                {categorized.upcoming.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-600">Schedule your first appointment.</p>
                  </div>
                ) : (
                  categorized.upcoming.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor?.name || 'Your Appointment'}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-1 text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Doctor: {appointment.doctor?.name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Link 
                            to="/my-appointments" 
                            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors inline-flex items-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Manage Appointment
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {[...categorized.completed, ...categorized.past].map((appointment) => (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor?.name || 'Your Appointment'}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <User className="w-4 h-4 mr-2" />
                          {appointment.doctor?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      name="name"
                      onChange={handleProfileChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink transition-all duration-300 ${
                        editingProfile ? '' : 'bg-gray-50'
                      }`}
                      readOnly={!editingProfile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      name="email"
                      onChange={handleProfileChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink transition-all duration-300 ${
                        editingProfile ? '' : 'bg-gray-50'
                      }`}
                      readOnly={!editingProfile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      name="phone"
                      onChange={handleProfileChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink transition-all duration-300 ${
                        editingProfile ? '' : 'bg-gray-50'
                      }`}
                      readOnly={!editingProfile}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    {editingProfile ? (
                      <>
                        <button
                          onClick={handleProfileCancel}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                          disabled={profileSaving}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileSave}
                          className="px-4 py-2 bg-gradient-to-r from-medical-pink to-medical-blue text-white rounded-lg hover:shadow-lg hover:shadow-medical-pink/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                          disabled={profileSaving}
                        >
                          {profileSaving ? 'Saving...' : (
                            <>
                              <Save className="w-4 h-4 mr-1" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleProfileEdit}
                        className="px-4 py-2 bg-gradient-to-r from-medical-pink to-medical-blue text-white rounded-lg hover:shadow-lg hover:shadow-medical-pink/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                  {profileSuccess && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                      {profileSuccess}
                    </div>
                  )}
                  {authError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {authError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;