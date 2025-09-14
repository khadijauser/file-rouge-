import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { Calendar, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateForm } from '../utils/validation';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    notes: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest('/users/doctors');
        setDoctors(res.doctors || []);
      } catch (err) {
        setError(err.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const validateField = (field) => {
    const fieldConfig = {
      [field]: {
        value: formData[field],
        required: true,
        type: field === 'date' ? 'date' : field === 'time' ? 'time' : 'text',
      }
    };

    const { errors: fieldErrors } = validateForm(fieldConfig);
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field] || []
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    if (touched[field] || formData[field]) {
      validateField(field);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const fieldsToValidate = {
      doctor: { value: formData.doctor, required: true },
      date: { value: formData.date, required: true, type: 'date' },
      time: { value: formData.time, required: true, type: 'time' },
      notes: { value: formData.notes, required: false }
    };

    const { isValid, errors: formErrors } = validateForm(fieldsToValidate);
    setErrors(formErrors);
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);

    if (!isValid) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/appointments', 'POST', {
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        notes: formData.notes
      });
      setSuccess(true);
      toast.success('Appointment booked successfully');
      navigate('/my-appointments');
    } catch (err) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }  
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-medical-blue/10">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to book an appointment</p>
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

  if (user.role === 'doctor' || user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-medical-blue/10">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Only patients can book appointments. Doctors can view and manage appointments from their dashboard.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-medical-blue/10">
          <div className="w-16 h-16 bg-medical-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-medical-green" />
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500 mb-4">Redirecting to your appointments...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-8 mt-8 ">
            <span className="bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">Book Your Appointment</span>
          </h1>
          <p className="text-lg text-gray-600">
            Schedule a consultation with our expert medical professionals
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-medical-blue/10 hover:shadow-xl transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Doctor
              </label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                onBlur={() => handleBlur('doctor')}
                required
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  touched.doctor && errors.doctor ? 'border-red-500' : ''
                }`}
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialty || doctor.role}
                  </option>
                ))}
              </select>
              {touched.doctor && errors.doctor && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.doctor.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  <Calendar className="inline-block mr-1" size={18} />
Date *
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  onBlur={() => handleBlur('date')}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    touched.date && errors.date ? 'border-red-500' : ''
                  }`}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                {touched.date && errors.date && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.date.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                  <Clock className="inline-block mr-1" size={18} />
Time *
                </label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  onBlur={() => handleBlur('time')}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    touched.time && errors.time ? 'border-red-500' : ''
                  }`}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {touched.time && errors.time && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.time.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-medical-pink to-medical-blue text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking Appointment...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;