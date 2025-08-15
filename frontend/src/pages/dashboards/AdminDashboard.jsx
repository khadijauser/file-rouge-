import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  Settings, 
  BarChart3,
  Shield,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  const stats = [
    { 
      label: 'Total Users', 
      value: '2,847', 
      change: '+12%', 
      color: 'blue',
      icon: Users,
      trend: 'up'
    },
    { 
      label: 'Appointments Today', 
      value: '156', 
      change: '+8%', 
      color: 'green',
      icon: Calendar,
      trend: 'up'
    },
    { 
      label: 'Monthly Revenue', 
      value: '$45,280', 
      change: '+15%', 
      color: 'purple',
      icon: DollarSign,
      trend: 'up'
    },
    { 
      label: 'Active Doctors', 
      value: '24', 
      change: '+2', 
      color: 'orange',
      icon: Shield,
      trend: 'up'
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      role: 'doctor',
      status: 'active',
      joinDate: '2024-01-15',
      appointments: 45,
      rating: 4.9
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john.doe@email.com',
      role: 'patient',
      status: 'active',
      joinDate: '2024-02-01',
      appointments: 3,
      rating: null
    },
    {
      id: 3,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@clinic.com',
      role: 'doctor',
      status: 'active',
      joinDate: '2023-12-10',
      appointments: 67,
      rating: 4.8
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      role: 'patient',
      status: 'inactive',
      joinDate: '2024-01-20',
      appointments: 1,
      rating: null
    }
  ];

  const services = [
    {
      id: 1,
      name: 'Botox Treatment',
      category: 'aesthetic',
      price: '$400',
      duration: '30 min',
      bookings: 156,
      status: 'active'
    },
    {
      id: 2,
      name: 'Teeth Whitening',
      category: 'dental',
      price: '$300',
      duration: '60 min',
      bookings: 89,
      status: 'active'
    },
    {
      id: 3,
      name: 'Dermal Fillers',
      category: 'aesthetic',
      price: '$600',
      duration: '45 min',
      bookings: 123,
      status: 'active'
    },
    {
      id: 4,
      name: 'Dental Implants',
      category: 'dental',
      price: '$2000',
      duration: '120 min',
      bookings: 34,
      status: 'active'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      description: 'New patient registered: Emma Thompson',
      timestamp: '2 hours ago',
      icon: UserPlus,
      color: 'green'
    },
    {
      id: 2,
      type: 'appointment_booked',
      description: 'Appointment booked: Botox - Dr. Sarah Johnson',
      timestamp: '3 hours ago',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 3,
      type: 'service_updated',
      description: 'Service updated: Teeth Whitening price changed',
      timestamp: '5 hours ago',
      icon: Settings,
      color: 'orange'
    },
    {
      id: 4,
      type: 'doctor_joined',
      description: 'New doctor registered: Dr. Lisa Wang',
      timestamp: '1 day ago',
      icon: Shield,
      color: 'purple'
    }
  ];

  const getStatColor = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'patient': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}. Manage your platform and monitor performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatColor(stat.color)}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
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
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activities */}
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

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left">
                        <UserPlus className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">Add User</p>
                        <p className="text-sm text-gray-600">Create new account</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left">
                        <Plus className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">New Service</p>
                        <p className="text-sm text-gray-600">Add treatment</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left">
                        <Download className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">Export Data</p>
                        <p className="text-sm text-gray-600">Download reports</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-left">
                        <Settings className="w-6 h-6 text-sky-600 mb-2" />
                        <p className="font-medium text-gray-900">Settings</p>
                        <p className="text-sm text-gray-600">System config</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button className="mt-4 sm:mt-0 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="patient">Patients</option>
                    <option value="doctor">Doctors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Appointments</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-900">{user.appointments}</td>
                          <td className="py-4 px-4 text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button className="text-sky-600 hover:text-sky-700">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-700">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Service Management</h3>
                  <button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900 capitalize">{service.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium text-gray-900">{service.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">{service.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bookings:</span>
                          <span className="font-medium text-gray-900">{service.bookings}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 text-sky-600 border border-sky-600 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors text-sm">
                          Edit
                        </button>
                        <button className="flex-1 text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
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

                {/* Export Options */}
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