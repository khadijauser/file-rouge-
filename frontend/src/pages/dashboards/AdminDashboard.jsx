import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { apiRequest } from '../../api';
import { 
  Users, Calendar, Shield, Edit, Trash2, Plus, Search,
  BarChart3, FileText, UserPlus, Eye, EyeOff, Settings, Download 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  const resetUserForm = () => {
    setUserForm({ name: '', email: '', password: '', role: 'patient', phone: '' });
    setEditingUser(null);
    setShowUserForm(false);
  };

  const getServiceId = (service) => service._id || service.id;

  const updateServiceState = (action, serviceData) => {
    switch (action) {
      case 'add':
        setServices(prev => [...prev, serviceData]);
        break;
      case 'update':
        setServices(prev => prev.map(s => 
          (s._id === serviceData.id || s.id === serviceData.id) ? { ...s, ...serviceData } : s
        ));
        break;
      case 'delete':
        setServices(prev => prev.filter(s => s._id !== serviceData.id && s.id !== serviceData.id));
        break;
      case 'set':
        setServices(Array.isArray(serviceData) ? serviceData : []);
        break;
      default:
        break;
    }
  };

  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const data = await apiRequest('/services');
      updateServiceState('set', Array.isArray(data) ? data : (data.services || []));
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      if (user?.role !== 'admin') {
        console.warn('Unauthorized access attempt to fetch users');
        return;
      }
      
      const response = await apiRequest('/users/all');
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (user?.role !== 'admin') {
        console.warn('Unauthorized access attempt to fetch dashboard data');
        return;
      }
      
      const [usersResponse, appointmentsResponse] = await Promise.all([
        apiRequest('/users/all'),
        apiRequest('/appointments')
      ]);
      const totalUsers = usersResponse.users.length;
      const totalAppointments = appointmentsResponse.appointments.length;
      const activeDoctors = usersResponse.users.filter(user => user.role === 'doctor').length;
      
      setStats([
        { label: 'Total Users', value: totalUsers.toString(), color: 'blue', icon: Users },
        { label: 'Total Appointments', value: totalAppointments.toString(), color: 'green', icon: Calendar },
        { label: 'Active Doctors', value: activeDoctors.toString(), color: 'orange', icon: Shield }
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchServices();
      fetchUsers();
      fetchDashboardData();
      fetchRecentActivities();
    }
  }, [user]);

  const handleEditService = (serviceId) => {
    const serviceToEdit = services.find(service => getServiceId(service) === serviceId);
    if (serviceToEdit) {
      setEditingService({...serviceToEdit, id: getServiceId(serviceToEdit)}); 
      setShowServiceForm(true);
      toast.info('Edit service details');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await apiRequest(`/services/${serviceId}`, 'DELETE');
        updateServiceState('delete', { id: serviceId, _id: serviceId });
        toast.success('Service deleted successfully');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const handleAddUser = () => {
    resetUserForm();
    setShowUserForm(true);
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
          resetUserForm();
          fetchUsers();
        } else {
          toast.error('Failed to update user: No response from server');
        }
      } else {
        const response = await apiRequest('/users/register', 'POST', userForm);
        if (response) {
          toast.success('User added successfully');
          resetUserForm();
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
    resetUserForm();
    toast.info('User form cancelled');
  };

  const handleAddService = () => {
    setEditingService({ id: 'new', title: '', category: 'aesthetic', description: '', image: null });
    setShowServiceForm(true);
    toast.info('Please fill in the service details');
  };



  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      patient: 'bg-green-100 text-green-800'
    };
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', color: 'blue', icon: Users },
    { label: 'Total Appointments', value: '0', color: 'green', icon: Calendar },
    { label: 'Active Doctors', value: '0', color: 'orange', icon: Shield }
  ]);
  const [recentActivities, setRecentActivities] = useState([{
    id: 'loading', type: 'loading', description: 'Loading recent activities...',
    timestamp: '', icon: Calendar, color: 'gray'
  }]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'patient', phone: ''
  });


  



  
  const fetchRecentActivities = async () => {
    try {
      if (user?.role !== 'admin') {
        console.warn('Unauthorized access attempt to fetch recent activities');
        return;
      }
      
      const [appointmentsResponse, usersResponse, galleryResponse] = await Promise.all([
        apiRequest('/appointments'),
        apiRequest('/users/all'),
        apiRequest('/gallery')
      ]);
      
      const recentUsers = [...usersResponse.users]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 2);
      const recentAppointments = [...appointmentsResponse.appointments]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 2);
      const recentGallery = [...galleryResponse.galleryItems]
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
        ...recentAppointments.map((appointment, index) => ({
          id: `appointment-${appointment._id || index}`,
          type: 'appointment_booked',
          description: `Appointment booked: ${appointment.patient?.name || 'Unknown Patient'} with ${appointment.doctor?.name || 'Unknown Doctor'}`,
          timestamp: formatTimeAgo(appointment.createdAt),
          icon: Calendar,
          color: 'blue'
        })),
        ...recentGallery.map((item, index) => ({
          id: `gallery-${item._id || index}`,
          type: 'gallery_upload',
          description: `New before/after images added by ${item.doctor?.name || 'Unknown Doctor'}`,
          timestamp: formatTimeAgo(item.createdAt),
          icon: FileText,
          color: 'orange'
        }))
      ];
      
      const sortedActivities = formattedActivities
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 5);
      
      setRecentActivities(sortedActivities.length > 0 ? sortedActivities : [{
        id: 'no-activity', type: 'no_activity', description: 'No recent activities found',
        timestamp: '', icon: Calendar, color: 'gray'
      }]);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([{
        id: 'error', type: 'error', description: 'Failed to load recent activities',
        timestamp: '', icon: Calendar, color: 'red'
      }]);
    }
  };


  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    if (diffHours > 0) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    if (diffMins > 0) return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    return 'Just now';
  };
  

  const getStatColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600', 
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
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
                { id: 'services', name: 'Services', icon: Settings }
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
                    <div className="grid grid-cols-3 gap-3 w-full">
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
                            if (user?.role !== 'admin') {
                              toast.error('Access denied. Admin privileges required.');
                              return;
                            }
                            
                            const usersResponse = await apiRequest('/users/all');
                            const appointmentsResponse = await apiRequest('/appointments');
                            
                            const exportData = {
                              users: usersResponse.users || [],
                              appointments: appointmentsResponse.appointments || [],
                              exportDate: new Date().toISOString(),
                              exportedBy: user?.name || 'Admin'
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
                                updateServiceState('add', {
                                  _id: newService._id,
                                  id: newService._id,
                                  ...payload
                                });
                                toast.success('Service added successfully');
                              } else {
                                const updatedService = await apiRequest(`/services/${editingService.id}`, 'PUT', payload);
                                updateServiceState('update', {
                                  id: editingService.id,
                                  ...payload
                                });
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
                  {services.map((service) => {
                    const serviceId = getServiceId(service);
                    return (
                      <div key={serviceId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                            onClick={() => handleEditService(serviceId)}
                          >
                            Edit
                          </button>
                          <button 
                            className="flex-1 text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                            onClick={() => handleDeleteService(serviceId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
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