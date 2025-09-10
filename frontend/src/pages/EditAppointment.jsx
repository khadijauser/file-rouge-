import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api';
import { Calendar, Clock, User, ArrowLeft, CheckCircle, FileText } from 'lucide-react';

const EditAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    notes: ''
  });
  const [originalAppointment, setOriginalAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const appointmentRes = await apiRequest(`/appointments/${id}`);
        if (!appointmentRes || !appointmentRes.appointment) {
          throw new Error('Appointment not found');
        }
        
        const appt = appointmentRes.appointment;
        
        if (user.role === 'patient' && appt.patient._id.toString() !== user.id.toString()) {
          throw new Error('You can only edit your own appointments');
        }
        
        setOriginalAppointment(appt);
        setFormData({
          doctor: appt.doctor?._id || '',
          date: appt.date || '',
          time: appt.time || '',
          notes: appt.notes || ''
        });
        
        const doctorsRes = await apiRequest('/users/doctors');
        setDoctors(doctorsRes.doctors || []);
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError(err.message || 'Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (!formData.doctor || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields');
      }

      const selectedDate = new Date(formData.date);
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const today = new Date();
      const now = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      
      if (selectedDateTime < now) {
        throw new Error('Appointment time cannot be in the past for today\'s date');
      }

      const appointmentData = {
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        notes: formData.notes || ''
      };

      console.log('Sending update request with data:', appointmentData);
      try {
        const response = await apiRequest(`/appointments/${id}`, 'PUT', appointmentData);
        console.log('Update response:', response);
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-appointments');
        }, 1500);
      } catch (apiError) {
        console.error('API Error:', apiError);
        if (apiError.status === 400) {
          setError(apiError.message || 'Invalid appointment data. Please check your selections.');
        } else if (apiError.status === 403) {
          setError('You do not have permission to update this appointment.');
        } else if (apiError.status === 404) {
          setError('Appointment not found. It may have been cancelled or deleted.');
        } else {
          setError(apiError.message || 'Failed to update appointment. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in form validation:', err);
      setError(err.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-medical-blue/10 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">Please log in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to edit appointments.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && !originalAppointment) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
   
  if (error && !originalAppointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-medical-blue/10 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
          >
            Back to My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/my-appointments')}
          className="flex items-center text-medical-blue hover:text-medical-pink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Appointments
        </button>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-medical-pink to-medical-blue px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Appointment</h1>
          </div>
          
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-medical-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-medical-green" />
                </div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent mb-2">Appointment Updated!</h2>
                <p className="text-gray-600 mb-6">Your appointment has been successfully updated.</p>
                <p className="text-gray-500 text-sm">Redirecting to My Appointments...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="doctor">
                    <User className="w-4 h-4 inline-block mr-2" />
                    Select Doctor
                  </label>
                  <select
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="date">
                    <Calendar className="w-4 h-4 inline-block mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="time">
                    <Clock className="w-4 h-4 inline-block mr-2" />
                    Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
                    required
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
                    <FileText className="w-4 h-4 inline-block mr-2" />
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
                    placeholder="Any special requests or information for the doctor"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/my-appointments')}
                    className="px-6 py-2 border border-gray-300 rounded-lg mr-4 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-medical-pink to-medical-blue text-white rounded-lg hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditAppointment;