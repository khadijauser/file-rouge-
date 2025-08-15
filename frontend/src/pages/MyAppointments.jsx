import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

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
      console.log('=== FETCHING APPOINTMENTS ===');
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      console.log('User role:', user?.role);
      
      const res = await apiRequest('/appointments');
      console.log('=== BACKEND RESPONSE ===');
      console.log('Full response:', res);
      console.log('Appointments array:', res.appointments);
      console.log('Appointments length:', res.appointments?.length);
      console.log('Categorized data:', res.categorized);
      console.log('Summary:', res.summary);
      
      // Handle both response formats (backward compatibility)
      const appointmentsData = res.appointments || res || [];
      console.log('Final appointments data to set:', appointmentsData);
      
      setAppointments(appointmentsData);
      console.log('State updated with appointments:', appointmentsData);
    } catch (err) {
      console.error('=== ERROR FETCHING APPOINTMENTS ===');
      console.error('Error details:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const categorizeAppointments = () => {
    console.log('=== CATEGORIZING APPOINTMENTS ===');
    console.log('Input appointments:', appointments);
    console.log('Appointments length:', appointments?.length);
    
    if (!appointments || appointments.length === 0) {
      console.log('No appointments to categorize');
      return { upcoming: [], past: [], completed: [], cancelled: [] };
    }
    
    const now = new Date();
    console.log('Current time:', now);
    console.log('Current time ISO:', now.toISOString());
    
    const result = appointments.reduce((acc, appt) => {
      console.log('--- Processing appointment ---');
      console.log('Appointment:', appt);
      console.log('Appointment date:', appt.date);
      console.log('Appointment time:', appt.time);
      console.log('Appointment status:', appt.status);
      
      let apptDateTime;
      try {
        if (appt.date && appt.time) {
          apptDateTime = new Date(appt.date + 'T' + appt.time);
        } else if (appt.date) {
          apptDateTime = new Date(appt.date);
        } else {
          console.log('No valid date/time found, skipping');
          return acc;
        }
        
        console.log('Parsed appointment datetime:', apptDateTime);
        console.log('Is valid date?', !isNaN(apptDateTime.getTime()));
        
        if (isNaN(apptDateTime.getTime())) {
          console.log('Invalid date, skipping appointment');
          return acc;
        }
        
        console.log('Is appointment in future?', apptDateTime >= now);
        
        if (appt.status === 'cancelled') {
          acc.cancelled.push(appt);
          console.log('Added to cancelled');
        } else if (appt.status === 'completed') {
          acc.completed.push(appt);
          console.log('Added to completed');
        } else if (apptDateTime >= now) {
          acc.upcoming.push(appt);
          console.log('Added to upcoming');
        } else {
          acc.past.push(appt);
          console.log('Added to past');
        }
      } catch (error) {
        console.error('Error processing appointment:', error);
        acc.past.push(appt);
      }
      
      return acc;
    }, { upcoming: [], past: [], completed: [], cancelled: [] });
    
    console.log('=== CATEGORIZATION RESULT ===');
    console.log('Final result:', result);
    console.log('Upcoming count:', result.upcoming.length);
    console.log('Past count:', result.past.length);
    console.log('Completed count:', result.completed.length);
    console.log('Cancelled count:', result.cancelled.length);
    
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
    return user?.role === 'admin' || appt.patient?._id === user?.id || appt.doctor?._id === user?.id;
  };

  const canUpdateStatus = (appt) => {
    return user?.role === 'admin' || user?.role === 'doctor';
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      await apiRequest(`/appointments/${id}`, 'DELETE');
      await fetchAppointments();
    } catch (err) {
      alert(err.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await apiRequest(`/appointments/${id}`, 'PUT', { status });
      await fetchAppointments();
    } catch (err) {
      alert(err.message || 'Status update failed');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">No Appointments</h2>
          <p className="text-gray-600 mb-6">You don't have any appointments scheduled yet.</p>
          <button
            onClick={() => window.location.href = '/book-appointment'}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors"
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

  console.log('=== FINAL CATEGORIES ===');
  console.log('Sorted upcoming:', sortedUpcoming);
  console.log('Sorted past:', sortedPast);
  console.log('Sorted completed:', sortedCompleted);
  console.log('Sorted cancelled:', sortedCancelled);

  const renderAppointmentCard = (appt, showActions = true) => {
    const isUpcoming = categories.upcoming.includes(appt);
    const isTodayAppt = isToday(appt.date);

  return (
      <div key={appt._id} className={`bg-white rounded-lg border p-4 mb-4 transition-all hover:shadow-md ${
        isUpcoming ? 'border-sky-200 shadow-md' : 'border-gray-200'
      } ${isTodayAppt ? 'ring-2 ring-blue-200' : ''}`}>
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
                <span className="text-xs text-sky-600 font-medium">
                  ({getTimeUntilAppointment(appt.date, appt.time)} away)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {user?.role === 'patient' ? `Dr. ${appt.doctor?.name || 'Unknown'}` : appt.patient?.name || 'Unknown'}
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
          {showActions && (
            <div className="flex flex-col gap-2">
                    {canCancel(appt) && appt.status !== 'cancelled' && (
                      <button
                        className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
                        onClick={() => handleCancel(appt._id)}
                        disabled={actionLoading === appt._id}
                      >
                        {actionLoading === appt._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {canUpdateStatus(appt) && appt.status !== 'cancelled' && (
                      <select
                        value={appt.status}
                        onChange={e => handleStatusChange(appt._id, e.target.value)}
                        className="px-2 py-1 rounded border border-gray-300 text-xs"
                        disabled={actionLoading === appt._id}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">My Appointments</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Debug Information</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Raw appointments count: {appointments.length}</div>
            <div>User ID: {user?.id}</div>
            <div>User role: {user?.role}</div>
            <div>Upcoming: {sortedUpcoming.length}</div>
            <div>Past: {sortedPast.length}</div>
            <div>Completed: {sortedCompleted.length}</div>
            <div>Cancelled: {sortedCancelled.length}</div>
          </div>
          {appointments.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-yellow-800 font-medium">Show Raw Appointments</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                {JSON.stringify(appointments, null, 2)}
              </pre>
            </details>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center border border-sky-200 shadow-sm">
            <div className="text-2xl font-bold text-sky-600">{sortedUpcoming.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{sortedPast.length}</div>
            <div className="text-sm text-gray-600">Past</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-green-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{sortedCompleted.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-red-200 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{sortedCancelled.length}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

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
                  <div className="text-sm text-sky-100">Doctor</div>
                  <div className="font-semibold">
                    {user?.role === 'patient' ? `Dr. ${sortedUpcoming[0].doctor?.name || 'Unknown'}` : sortedUpcoming[0].patient?.name || 'Unknown'}
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
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors"
          >
            Book New Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments; 