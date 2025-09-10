import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, galleryAPI } from '../../api';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Plus, Image, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

import { assetUrl } from '../../api';

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image';
  
  if (typeof path === 'string' && path.startsWith('data:')) {
    return path;
  }
  
  return assetUrl(path);
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    treatmentType: '',
    beforeImage: null,
    afterImage: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await apiRequest(`/appointments/${appointmentId}/status`, 'PUT', { status: newStatus });
      toast.success(`Appointment ${newStatus} successfully`);
      const res = await apiRequest('/appointments');
      setAppointments(res.appointments || []);
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment status');
      setError(err.message || 'Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await apiRequest(`/appointments/${appointmentId}/status`, 'PUT', { status: 'cancelled' });
      toast.success('Appointment cancelled successfully');
      const res = await apiRequest('/appointments');
      setAppointments(res.appointments || []);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  const fetchGalleryItems = async () => {
    try {
      setGalleryLoading(true);
      const res = await galleryAPI.getItems();
      setGalleryItems(res.galleryItems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') fetchGalleryItems();
  }, [activeTab]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      treatmentType: '',
      beforeImage: null,
      afterImage: null
    });
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    try {
      const before = formData.beforeImage ? await fileToDataUrl(formData.beforeImage) : null;
      const after = formData.afterImage ? await fileToDataUrl(formData.afterImage) : null;

      if (!before || !after) {
        throw new Error('Both before and after images are required');
      }

      await galleryAPI.addItem({
        title: formData.title,
        description: formData.description,
        treatmentType: formData.treatmentType,
        isPublic: true,
        beforeImage: before,
        afterImage: after
      });

      setShowAddModal(false);
      resetForm();
      fetchGalleryItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditGalleryItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        treatmentType: formData.treatmentType,
        isPublic: true
      };
      if (formData.beforeImage) payload.beforeImage = await fileToDataUrl(formData.beforeImage);
      if (formData.afterImage) payload.afterImage = await fileToDataUrl(formData.afterImage);

      await galleryAPI.updateItem(editingItem._id, payload);

      setShowEditModal(false);
      setEditingItem(null);
      resetForm();
      await fetchGalleryItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (window.confirm('Delete this gallery item?')) {
      try {
        await galleryAPI.deleteItem(id);
        fetchGalleryItems();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      treatmentType: item.treatmentType,
      beforeImage: null, 
      afterImage: null  
    });
    setShowEditModal(true);
  };

  const generateSchedule = (date) => {
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    const dayAppointments = appointments.filter(apt => apt.date === date);

    return timeSlots.map(time => {
      const appointment = dayAppointments.find(apt => apt.time === time);
      
      if (time === '12:00') {
        return { time, patient: 'Lunch Break', type: 'break' };
      } else if (appointment) {
        return { 
          time, 
          patient: appointment.patient?.name || 'Unknown Patient', 
          type: 'appointment',
          appointmentId: appointment._id,
          status: appointment.status
        };
      } else {
        return { time, patient: 'Available', type: 'available' };
      }
    });
  };

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const schedule = generateSchedule(selectedDate);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatColor = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'yellow': return 'bg-yellow-100 text-yellow-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const stats = [
    { 
      label: 'Today\'s Appointments', 
      value: appointments.filter(apt => apt.date === today).length.toString(), 
      color: 'blue' 
    },
    { 
      label: 'This Week', 
      value: appointments.filter(apt => new Date(apt.date) >= weekAgo).length.toString(), 
      color: 'green' 
    },
    { 
      label: 'Pending Confirmations', 
      value: appointments.filter(apt => apt.status === 'pending').length.toString(), 
      color: 'yellow' 
    },
    { 
      label: 'Total Appointments', 
      value: appointments.length.toString(), 
      color: 'purple' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent">
            Doctor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, Dr. {user?.name}. Manage your appointments and patient gallery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow hover:shadow-medical-pink/10 hover:-translate-y-1 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r from-pink-400/20 to-medical-blue/20 text-medical-pink">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
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
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'schedule'
                    ? 'border-medical-pink text-medical-pink'
                    : 'border-transparent text-gray-500 hover:text-medical-pink hover:border-medical-pink/30'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'gallery'
                    ? 'border-medical-pink text-medical-pink'
                    : 'border-transparent text-gray-500 hover:text-medical-pink hover:border-medical-pink/30'
                }`}
              >
                Gallery Management
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Appointments</h3>
                </div>
                
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
                    <p className="text-gray-600">When patients book appointments with you, they will appear here.</p>
                  </div>
                ) : (
                                    appointments.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{appointment.patient?.name || 'Unknown Patient'}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                          <div>
                            <div className="flex items-center mb-1">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center mb-1">
                              <Clock className="w-4 h-4 mr-2" />
                              {appointment.time}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <User className="w-4 h-4 mr-2" />
                              Patient: {appointment.patient?.name || 'Unknown'}
                            </div>
                            <div className="flex items-center mb-1">
                              <Phone className="w-4 h-4 mr-2" />
                              {appointment.patient?.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-2 italic">
                          Appointment ID: {appointment._id}
                        </p>
                      </div>
                      <div className="mt-4 lg:mt-0 flex gap-2">
                        {appointment.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                            className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {schedule.map((slot, index) => (
                    <div key={index} className={`flex items-center p-4 rounded-lg ${
                      slot.type === 'available' 
                        ? 'bg-green-50 border border-green-200' 
                        : slot.type === 'break'
                        ? 'bg-gray-50 border border-gray-200'
                        : slot.type === 'appointment'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className="w-20 text-sm font-medium text-gray-900">
                        {slot.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{slot.patient}</div>
                        {slot.service && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            {slot.service}
                            {slot.status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                slot.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                slot.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                slot.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {slot.status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {slot.type === 'appointment' && (
                        <div className="flex gap-2">
                          {slot.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(slot.appointmentId, 'confirmed')}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          <button 
                            onClick={() => handleCancelAppointment(slot.appointmentId)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Gallery Management</h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Images
                  </button>
                </div>

                {galleryLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                ) : galleryItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Gallery Items</h3>
                    <p className="text-gray-600 mb-6">Add your first before/after treatment results.</p>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
                    >
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {galleryItems.map((item) => (
                      <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Before</p>
                            <img 
                              src={getImageUrl(item.beforeImage)} 
                              alt="Before" 
                              className="w-full h-40 object-cover rounded" 
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJlZm9yZTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">After</p>
                            <img 
                              src={getImageUrl(item.afterImage)} 
                              alt="After" 
                              className="w-full h-40 object-cover rounded" 
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFmdGVyPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1"><strong>Treatment:</strong> {item.treatmentType}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-1"><strong>Description:</strong> {item.description}</p>
                          )}
                          <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex justify-end items-center text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(item)} className="text-medical-pink hover:text-medical-blue transition-colors duration-300 flex items-center">
                              <Edit className="w-3 h-3 mr-1" />Edit
                            </button>
                            <button onClick={() => handleDeleteGalleryItem(item._id)} className="text-red-500 hover:text-red-600 transition-colors duration-300 flex items-center">
                              <Trash2 className="w-3 h-3 mr-1" />Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Gallery Item</h3>
              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink"
                />
                
                <select
                  value={formData.treatmentType}
                  onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink"
                >
                  <option value="">Select treatment type</option>
                  <optgroup label="Aesthetic Medicine">
                    <option value="aesthetic-botox">Botox</option>
                    <option value="aesthetic-fillers">Dermal Fillers</option>
                    <option value="aesthetic-chemical">Chemical Peel</option>
                    <option value="aesthetic-laser">Laser Treatment</option>
                    <option value="aesthetic-other">Other Aesthetic Treatments</option>
                  </optgroup>
                  <optgroup label="Dental Care">
                    <option value="dental-whitening">Teeth Whitening</option>
                    <option value="dental-veneers">Veneers</option>
                    <option value="dental-implants">Dental Implants</option>
                    <option value="dental-orthodontics">Orthodontics</option>
                    <option value="dental-other">Other Dental Treatments</option>
                  </optgroup>
                  <optgroup label="Dermatology">
                    <option value="dermatology-acne">Acne Treatment</option>
                    <option value="dermatology-scar">Scar Revision</option>
                    <option value="dermatology-pigmentation">Pigmentation Treatment</option>
                    <option value="dermatology-other">Other Dermatology Treatments</option>
                  </optgroup>
                </select>
                
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Before Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, beforeImage: e.target.files[0]})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink file:bg-medical-pink/20 file:text-gray-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">After Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, afterImage: e.target.files[0]})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink file:bg-medical-pink/20 file:text-gray-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                    />
                  </div>
                </div>
                

                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-medical-pink to-medical-blue text-white py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300">
                    Add Item
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Gallery Item</h3>
              <form onSubmit={handleEditGalleryItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type</label>
                  <select
                    value={formData.treatmentType}
                    onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select treatment type</option>
                    <optgroup label="Aesthetic Medicine">
                      <option value="aesthetic-botox">Botox</option>
                      <option value="aesthetic-fillers">Dermal Fillers</option>
                      <option value="aesthetic-chemical">Chemical Peel</option>
                      <option value="aesthetic-laser">Laser Treatment</option>
                      <option value="aesthetic-other">Other Aesthetic Treatments</option>
                    </optgroup>
                    <optgroup label="Dental Care">
                      <option value="dental-whitening">Teeth Whitening</option>
                      <option value="dental-veneers">Veneers</option>
                      <option value="dental-implants">Dental Implants</option>
                      <option value="dental-orthodontics">Orthodontics</option>
                      <option value="dental-other">Other Dental Treatments</option>
                    </optgroup>
                    <optgroup label="Dermatology">
                      <option value="dermatology-acne">Acne Treatment</option>
                      <option value="dermatology-scar">Scar Revision</option>
                      <option value="dermatology-pigmentation">Pigmentation Treatment</option>
                      <option value="dermatology-other">Other Dermatology Treatments</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Before Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, beforeImage: e.target.files[0]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {editingItem?.beforeImage && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500 mb-1">Current image:</p>
                        <img 
                          src={getImageUrl(editingItem.beforeImage)} 
                          alt="Current Before" 
                          className="w-full h-20 object-cover rounded mt-1" 
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJlZm9yZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">After Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, afterImage: e.target.files[0]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {editingItem?.afterImage && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500 mb-1">Current image:</p>
                        <img 
                          src={getImageUrl(editingItem.afterImage)} 
                          alt="Current After" 
                          className="w-full h-20 object-cover rounded mt-1" 
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFmdGVyPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-medical-pink to-medical-blue text-white py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300"
                  >
                    Update Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;