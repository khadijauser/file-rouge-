import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle, Edit, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/appointments');
      
      const appointmentsData = res.appointments || res || [];
      
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const categorizeAppointments = () => {
    if (!appointments || appointments.length === 0) {
      return { upcoming: [], past: [], completed: [], cancelled: [] };
    }
    
    const now = new Date();
    
    const result = appointments.reduce((acc, appt) => {
      let apptDateTime;
      try {
        if (appt.date && appt.time) {
          apptDateTime = new Date(appt.date + 'T' + appt.time);
        } else if (appt.date) {
          apptDateTime = new Date(appt.date);
        } else {
          return acc;
        }
        
        if (isNaN(apptDateTime.getTime())) {
          return acc;
        }
        
        if (appt.status === 'cancelled') {
          acc.cancelled.push(appt);
        } else if (appt.status === 'completed') {
          acc.completed.push(appt);
        } else if (apptDateTime >= now) {
          acc.upcoming.push(appt);
        } else {
          acc.past.push(appt);
        }
      } catch (error) {
        acc.past.push(appt);
      }
      
      return acc;
    }, { upcoming: [], past: [], completed: [], cancelled: [] });
    
    return result;
  };

  const sortAppointments = (appointments) => {
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA - dateB;
    });
  };

  const getTimeUntilAppointment = (date, time) => {
    const now = new Date();
    const apptDateTime = new Date(date + 'T' + time);
    const diffMs = apptDateTime - now;
    
    if (diffMs <= 0) return 'Now';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'Less than an hour';
  };

  const canCancel = (appt) => {
    return true;
  };

  const canUpdateStatus = (appt) => {
    return user?.role === 'admin' || user?.role === 'doctor';
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await apiRequest(`/appointments/${id}/status`, 'PUT', { status: 'cancelled' });
      await fetchAppointments();
    } catch (err) {
      setError(err.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await apiRequest(`/appointments/${id}/status`, 'PUT', { status });
      await fetchAppointments();
    } catch (err) {
      setError(err.message || 'Status update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const apptDate = new Date(dateStr);
    return today.toDateString() === apptDate.toDateString();
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
  }

  if (!appointments.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 pt-20 pb-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-medical-blue/10 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-medical-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-medical-blue" />
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">No Appointments</h2>
          <p className="text-gray-600 mb-6">You don't have any appointments scheduled yet.</p>
          <button
            onClick={() => window.location.href = '/book-appointment'}
            className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
          >
            Book Your First Appointment
          </button>
        </div>
      </div>
    );
  }

  const categories = categorizeAppointments();
  const sortedUpcoming = sortAppointments(categories.upcoming);
  const sortedPast = sortAppointments(categories.past);
  const sortedCompleted = sortAppointments(categories.completed);
  const sortedCancelled = sortAppointments(categories.cancelled);

  const renderAppointmentCard = (appt, showActions = true) => {
    const isUpcoming = categories.upcoming.includes(appt);
    const isTodayAppt = isToday(appt.date);

  return (
      <div key={appt._id} className={`bg-white rounded-lg border p-4  mb-4 transition-all hover:shadow-md ${
        isUpcoming ? 'border-medical-blue/20 shadow-md' : 'border-gray-200'
      } ${isTodayAppt ? 'ring-2 ring-medical-pink/30' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                {formatDate(appt.date)}
                {isTodayAppt && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Today</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{appt.time}</span>
              {isUpcoming && (
                <span className="text-xs bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent font-medium">
                  ({getTimeUntilAppointment(appt.date, appt.time)} away)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {user?.role === 'patient' ? 
                  `Dr. ${appt.doctor?.name || 'Unknown'}` : 
                  user?.role === 'doctor' ? 
                    `Patient: ${appt.patient?.name || 'Unknown'}` :
                    `Dr. ${appt.doctor?.name || 'Unknown'} - Patient: ${appt.patient?.name || 'Unknown'}`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      appt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''
                    }`}>
                      {appt.status}
                    </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
                    {isUpcoming && appt.status !== 'cancelled' && appt.status !== 'completed' && (
                      <div className="flex gap-2">
                        <Link
                          to={`/edit-appointment/${appt._id}`}
                          className="px-3 py-1 rounded bg-medical-blue/20 text-medical-blue text-xs font-semibold hover:bg-medical-blue/30 transition-all duration-300 flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Link>
                        <button
                          className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors flex items-center"
                          onClick={() => handleCancel(appt._id)}
                          disabled={actionLoading === appt._id}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          {actionLoading === appt._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                    {canUpdateStatus(appt) && appt.status !== 'cancelled' && (
                      <select
                        value={appt.status}
                        onChange={e => handleStatusChange(appt._id, e.target.value)}
                        className="px-2 py-1 rounded border border-gray-300 text-xs"
                        disabled={actionLoading === appt._id}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 mt-4">
          <span className="bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">
            My Appointments
          </span>
        </h1>
        

      
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center border border-medical-blue/10 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-2xl font-bold bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">{sortedUpcoming.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-medical-blue/10 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-2xl font-bold text-gray-600">{sortedPast.length}</div>
            <div className="text-sm text-gray-600">Past</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-medical-blue/10 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-2xl font-bold text-medical-green">{sortedCompleted.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-medical-blue/10 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-2xl font-bold text-red-600">{sortedCancelled.length}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Next Appointment Quick View */}
        {sortedUpcoming.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Next Appointment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-sky-100">Date & Time</div>
                  <div className="font-semibold">
                    {formatDate(sortedUpcoming[0].date)} at {sortedUpcoming[0].time}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-sky-100">
                    {user?.role === 'patient' ? 'Doctor' : user?.role === 'doctor' ? 'Patient' : 'Participants'}
                  </div>
                  <div className="font-semibold">
                    {user?.role === 'patient' ? 
                      `Dr. ${sortedUpcoming[0].doctor?.name || 'Unknown'}` : 
                      user?.role === 'doctor' ? 
                        `${sortedUpcoming[0].patient?.name || 'Unknown'}` :
                        `Dr. ${sortedUpcoming[0].doctor?.name || 'Unknown'} - ${sortedUpcoming[0].patient?.name || 'Unknown'}`
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-sky-100">Status</div>
                  <div className="font-semibold capitalize">{sortedUpcoming[0].status}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-sky-100">
                {getTimeUntilAppointment(sortedUpcoming[0].date, sortedUpcoming[0].time)} until appointment
              </div>
            </div>
          </div>
        )}

       
        {sortedUpcoming.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-sky-600" />
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <span className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 rounded-full">
                {sortedUpcoming.length}
              </span>
            </div>
            <div className="space-y-3">
              {sortedUpcoming.map(appt => renderAppointmentCard(appt, true))}
            </div>
          </div>
        )}

        {sortedPast.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Past Appointments</h2>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {sortedPast.length}
              </span>
            </div>
            <div className="space-y-3">
              {sortedPast.map(appt => renderAppointmentCard(appt, false))}
            </div>
          </div>
        )}

        {sortedCompleted.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Completed Appointments</h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {sortedCompleted.length}
              </span>
            </div>
            <div className="space-y-3">
              {sortedCompleted.map(appt => renderAppointmentCard(appt, false))}
            </div>
          </div>
        )}

        {sortedCancelled.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Cancelled Appointments</h2>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {sortedCancelled.length}
              </span>
            </div>
            <div className="space-y-3">
              {sortedCancelled.map(appt => renderAppointmentCard(appt, false))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/book-appointment'}
            className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
          >
            Book New Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;