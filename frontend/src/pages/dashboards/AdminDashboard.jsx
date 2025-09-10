import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { apiRequest } from '../../api';
import { 
  Users, 
  Calendar, 
  Shield,
  Edit, Trash2, Plus, Search,
  TrendingUp, BarChart3, FileText,
  UserPlus, Eye, EyeOff, Settings, Download } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [serviceError, setServiceError] = useState(null);
  
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      setServiceError(null);
      try {
        const data = await apiRequest('/services');
        const formattedServices = data.map(service => ({
          id: service._id,
          title: service.title,
          category: service.category,
          description: service.description,
          image: service.image
        }));
        setServices(formattedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServiceError('Failed to load services. Please try again later.');
        toast.error('Failed to load services');
      } finally {
        setIsLoadingServices(false);
      }
    };
    
    fetchServices();
  }, []);
  

  const handleEditService = (serviceId) => {
    const serviceToEdit = services.find(service => service.id === serviceId);
    if (serviceToEdit) {
      setEditingService({...serviceToEdit}); 
      setShowServiceForm(true);
      toast.info('Edit service details');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await apiRequest(`/services/${serviceId}`, 'DELETE');
        setServices(services.filter(service => service.id !== serviceId));
        toast.success('Service deleted successfully');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const handleAddUser = () => {
    setShowUserForm(true);
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'patient',
      phone: ''
    });
    toast.info('Adding a new user');
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find(user => user._id === userId);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        password: '', 
        role: userToEdit.role || 'patient',
        phone: userToEdit.phone || ''
      });
      setShowUserForm(true);
      toast.info(`Editing user: ${userToEdit.name}`);
    } else {
      toast.error('User not found');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await apiRequest(`/users/${userId}`, 'DELETE');
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updatedUser = { ...userForm };
        if (!updatedUser.password) delete updatedUser.password;
        
        const response = await apiRequest(`/users/${editingUser._id}`, 'PUT', updatedUser);
        if (response) {
          toast.success('User updated successfully');
          setShowUserForm(false);
          setEditingUser(null);
          fetchUsers();
        } else {
          toast.error('Failed to update user: No response from server');
        }
      } else {
        const response = await apiRequest('/users/register', 'POST', userForm);
        if (response) {
          toast.success('User added successfully');
          setShowUserForm(false);
          setEditingUser(null);
          fetchUsers();
        } else {
          toast.error('Failed to add user: No response from server');
        }
      }
    } catch (error) {
      console.error('Error in handleUserFormSubmit:', error);
      toast.error(`Failed to ${editingUser ? 'update' : 'add'} user: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUserFormCancel = () => {
    setShowUserForm(false);
    setEditingUser(null);
    toast.info('User form cancelled');
  };

  const handleAddService = () => {
    setShowServiceForm(true);
    
    const newService = {
      id: 'new', 
      title: '',
      category: 'aesthetic',
      description: '',
      image: null,
      imageFile: null
    };
    
    setEditingService(newService);
    toast.info('Please fill in the service details');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [stats, setStats] = useState([
    { 
      label: 'Total Users', 
      value: '0', 
      change: 'Loading...', 
      color: 'blue',
      icon: Users
    },
    { 
      label: 'Total Appointments', 
      value: '0', 
      change: 'Loading...', 
      color: 'green',
      icon: Calendar
    },
    { 
      label: 'Active Doctors', 
      value: '0', 
      change: 'Loading...', 
      color: 'orange',
      icon: Shield
    }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersResponse = await apiRequest('/users');
        const totalUsers = usersResponse.users.length;
        const appointmentsResponse = await apiRequest('/appointments');
        const totalAppointments = appointmentsResponse.appointments.length;
        
        const activeDoctors = usersResponse.users.filter(user => 
          user.role === 'doctor'
        ).length;
        
       
        setStats([
          { 
            label: 'Total Users', 
            value: totalUsers.toString(), 
            change: `${Math.round(totalUsers * 0.15)}% increase from last month`, 
            color: 'blue',
            icon: Users
          },
          { 
            label: 'Total Appointments', 
            value: totalAppointments.toString(), 
            change: `${Math.round(totalAppointments * 0.08)}% increase from last month`, 
            color: 'green',
            icon: Calendar
          },
          { 
            label: 'Active Doctors', 
            value: activeDoctors.toString(), 
            change: `${Math.round(activeDoctors * 0.05)}% increase from last month`, 
            color: 'orange',
            icon: Shield
          }
        ]);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', error);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: ''
  });
  
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiRequest('/users');
      if (response && response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users data');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 'loading',
      type: 'loading',
      description: 'Loading recent activities...',
      timestamp: '',
      icon: Calendar,
      color: 'gray'
    }
  ]);
  
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const appointmentsResponse = await apiRequest('/appointments');
        const appointments = appointmentsResponse.appointments || [];
        
        const usersResponse = await apiRequest('/users');
        const users = usersResponse.users || [];
        
        const galleryResponse = await apiRequest('/gallery');
        const galleryItems = galleryResponse.galleryItems || [];
        
        const recentUsers = [...users]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 2);
          
        const recentAppointments = [...appointments]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 2);
          
        const recentGallery = [...galleryItems]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 2);
        
        const formattedActivities = [
          ...recentUsers.map((user, index) => ({
            id: `user-${user._id || index}`,
            type: 'user_registration',
            description: `New ${user.role} registered: ${user.name}`,
            timestamp: formatTimeAgo(user.createdAt),
            icon: UserPlus,
            color: user.role === 'doctor' ? 'purple' : 'green'
          })),
          
          ...recentAppointments.map((appointment, index) => {
            const doctorName = appointment.doctor?.name || 'Unknown Doctor';
            const patientName = appointment.patient?.name || 'Unknown Patient';
            return {
              id: `appointment-${appointment._id || index}`,
              type: 'appointment_booked',
              description: `Appointment booked: ${patientName} with ${doctorName}`,
              timestamp: formatTimeAgo(appointment.createdAt),
              icon: Calendar,
              color: 'blue'
            };
          }),
          
          ...recentGallery.map((item, index) => {
            const doctorName = item.doctor?.name || 'Unknown Doctor';
            return {
              id: `gallery-${item._id || index}`,
              type: 'gallery_upload',
              description: `New before/after images added by ${doctorName}`,
              timestamp: formatTimeAgo(item.createdAt),
              icon: FileText,
              color: 'orange'
            };
          })
        ];
        
        const sortedActivities = formattedActivities
          .sort((a, b) => {
            return b.timestamp.localeCompare(a.timestamp);
          })
          .slice(0, 5); 
        
        setRecentActivities(sortedActivities.length > 0 ? sortedActivities : [{
          id: 'no-activity',
          type: 'no_activity',
          description: 'No recent activities found',
          timestamp: '',
          icon: Calendar,
          color: 'gray'
        }]);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([{
          id: 'error',
          type: 'error',
          description: 'Failed to load recent activities',
          timestamp: '',
          icon: Calendar,
          color: 'red'
        }]);
      }
    };
    
    fetchRecentActivities();
  }, []);
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffMins > 0) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else {
      return 'Just now';
    }
  };
  

  const getStatColor = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };


  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm ? (
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : true;
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-pink-400 to-medical-blue bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}. Manage your platform and monitor performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow hover:shadow-medical-pink/20 hover:-translate-y-1 duration-300 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-700">{stat.label}</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-medical-blue bg-clip-text text-transparent mt-2">{stat.value}</p>
                    <div className="flex items-center mt-3">
                      <TrendingUp className="w-5 h-5 text-medical-pink mr-2" />
                      <span className="text-sm text-medical-pink font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-r from-pink-400/20 to-medical-blue/20 text-medical-pink">
                    <IconComponent className="w-8 h-8" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'users', name: 'User Management', icon: Users },
                { id: 'services', name: 'Services', icon: Settings },
                { id: 'reports', name: 'Reports', icon: FileText }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-medical-pink text-medical-pink'
                        : 'border-transparent text-gray-500 hover:text-medical-pink hover:border-medical-pink/30'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chart will be displayed when appointments are available</p>
                      </div>
                    </div>
                  </div>
                  
            
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chart will be displayed when more user data is available</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Active Doctors</p>
                      <p className="text-2xl font-bold text-gray-900">{users.filter(user => user.role === 'doctor').length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Patients</p>
                      <p className="text-2xl font-bold text-gray-900">{users.filter(user => user.role === 'patient').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => {
                        const IconComponent = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatColor(activity.color)}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button 
                        onClick={() => {
                          setActiveTab('users');
                          toast.info('Switched to User Management');
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left"
                      >
                        <UserPlus className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">Manage Users</p>
                        <p className="text-sm text-gray-600">View and edit users</p>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveTab('services');
                          toast.info('Switched to Services Management');
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left"
                      >
                        <Plus className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">Manage Services</p>
                        <p className="text-sm text-gray-600">View and edit services</p>
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            const usersResponse = await apiRequest('/users');
                            const appointmentsResponse = await apiRequest('/appointments');
                            
                            const exportData = {
                              users: usersResponse.users,
                              appointments: appointmentsResponse.appointments,
                              exportDate: new Date().toISOString(),
                              exportedBy: user?.name
                            };
                            
                            const dataStr = JSON.stringify(exportData, null, 2);
                            
                            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                            const exportFileDefaultName = `clinic-data-export-${new Date().toISOString().split('T')[0]}.json`;
                            
                            const linkElement = document.createElement('a');
                            linkElement.setAttribute('href', dataUri);
                            linkElement.setAttribute('download', exportFileDefaultName);
                            linkElement.click();
                            
                            toast.success('Data exported successfully');
                          } catch (error) {
                            console.error('Export error:', error);
                            toast.error('Failed to export data');
                          }
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left"
                      >
                        <Download className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">Export Data</p>
                        <p className="text-sm text-gray-600">Download reports</p>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveTab('reports');
                          toast.info('Switched to Reports');
                        }}
                        className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left"
                      >
                        <Settings className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">View Reports</p>
                        <p className="text-sm text-gray-600">Analytics & statistics</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                {showUserForm && (
                  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h4>
                    <form className="space-y-4" onSubmit={handleUserFormSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={userForm.name}
                          onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={userForm.email}
                          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                        </label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={userForm.password}
                            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                            placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                            required={!editingUser}
                          />
                          <button 
                            type="button" 
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={userForm.role}
                          onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          onClick={handleUserFormCancel}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                        >
                          {editingUser ? 'Update User' : 'Add User'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button 
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center"
                    onClick={handleAddUser}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink transition-all duration-300"
                    />
                  </div>
                  <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink transition-all duration-300"
                    >
                    <option value="all">All Roles</option>
                    <option value="patient">Patients</option>
                    <option value="doctor">Doctors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-pink-50 to-blue-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-medical-pink">User</th>
                        <th className="text-left py-3 px-4 font-medium text-medical-pink">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-medical-pink">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-medical-pink">Appointments</th>
                        <th className="text-left py-3 px-4 font-medium text-medical-pink">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium text-medical-pink">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-900">-</td>
                          <td className="py-4 px-4 text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditUser(user._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Service Management</h3>
                  <button 
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center"
                    onClick={() => handleAddService()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </button>
                </div>

                {showServiceForm && editingService && (
                  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingService.id === 'new' ? 'Add New Service' : 'Edit Service'}
                    </h4>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={editingService.title || ''}
                          onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                          placeholder="Enter service title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={editingService.category}
                          onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                        >
                          <option value="aesthetic">Aesthetic Medicine</option>
                          <option value="dental">Dental</option>
                          <option value="hair care">Hair Care</option>
                          <option value="dermatology">Dermatology</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={editingService.description || ''}
                          onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                          placeholder="Enter service description"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Image URL</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          value={editingService.image || ''}
                          onChange={(e) => setEditingService({...editingService, image: e.target.value})}
                          placeholder="https://... or /uploads/filename.jpg"
                        />
                        {editingService.image && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Preview:</p>
                            <img 
                              src={editingService.image} 
                              alt="Service preview" 
                              className="mt-1 h-20 w-auto object-cover rounded-md"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            setShowServiceForm(false);
                            setEditingService(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                          onClick={async () => {
                            if (!editingService.title) {
                              toast.error('Service title is required');
                              return;
                            }
                            
                            try {
                              const payload = {
                                title: editingService.title,
                                category: editingService.category,
                                description: editingService.description,
                                image: editingService.image || ''
                              };

                              if (editingService.id === 'new') {
                                const newService = await apiRequest('/services', 'POST', payload);
                                setServices([...services, {
                                  id: newService._id,
                                  title: newService.title,
                                  category: newService.category,
                                  description: newService.description,
                                  image: newService.image
                                }]);
                                toast.success('Service added successfully');
                              } else {
                                const updatedService = await apiRequest(`/services/${editingService.id}`, 'PUT', payload);
                                setServices(services.map(s => 
                                  s.id === editingService.id ? {
                                    id: updatedService._id,
                                    title: updatedService.title,
                                    category: updatedService.category,
                                    description: updatedService.description,
                                    image: updatedService.image
                                  } : s
                                ));
                                toast.success('Service updated successfully');
                              }
                            } catch (error) {
                              console.error('Error saving service:', error);
                              toast.error('Failed to save service');
                              return;
                            }
                            
                            setShowServiceForm(false);
                            setEditingService(null);
                          }}
                        >
                          {editingService.id === 'new' ? 'Add Service' : 'Update Service'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {service.category}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex flex-col">
                          <span className="text-gray-600 mb-1">Description:</span>
                          <p className="text-gray-900">{service.description}</p>
                        </div>
                        {service.image && (
                          <div className="mt-3">
                            <img 
                              src={service.image} 
                              alt={service.title} 
                              className="w-full h-32 object-cover rounded-md" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="flex-1 text-sky-600 border border-sky-600 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors text-sm"
                          onClick={() => handleEditService(service.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="flex-1 text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics & Reports</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h4>
                    <div className="h-48 flex items-end justify-between space-x-2">
                      {[65, 78, 82, 95, 88, 92, 85, 90, 87, 94, 91, 96].map((height, index) => (
                        <div key={index} className="bg-sky-500 rounded-t" style={{height: `${height}%`, width: '8%'}}></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>Jan</span>
                      <span>Dec</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Service Popularity</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Botox Treatment', percentage: 85 },
                        { name: 'Teeth Whitening', percentage: 70 },
                        { name: 'Dermal Fillers', percentage: 65 },
                        { name: 'Dental Implants', percentage: 45 }
                      ].map((service, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{service.name}</span>
                            <span className="text-gray-600">{service.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-sky-500 h-2 rounded-full" 
                              style={{width: `${service.percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export User Data
                  </button>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Appointments
                  </button>
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Financial Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;