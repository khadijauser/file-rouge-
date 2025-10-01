import { useState, useEffect } from 'react';
import { apiRequest, assetUrl } from '../api';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminServices, setAdminServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAdminServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiRequest('/services');
        const byId = new Map();
        data.forEach(svc => {
          if (svc && svc._id) byId.set(svc._id, svc);
        });
        const formatted = Array.from(byId.values()).map(service => ({
          id: service._id,
          category: service.category,
          title: service.title,
          description: service.description,
          image: buildServiceImage(service)
        }));
        setAdminServices(formatted);
      } catch (error) {
        console.error('Error fetching admin services:', error);
        setError('Failed to load admin services');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminServices();
  }, []);
  
  const CATEGORY_ALIASES = {
    'aesthetic': ['aesthetic', 'aesthetic medicine', 'cosmetic'],
    'dental': ['dental'],
    'dermatology': ['dermatology'],
    'hair care': ['hair', 'hair care']
  };

  const normalizeCategoryId = (value) => {
    const v = (value || '').toLowerCase();
    return Object.keys(CATEGORY_ALIASES).find(key => CATEGORY_ALIASES[key].includes(v)) || v;
  };

  const isInSelectedCategory = (selectedId, value) => {
    if (selectedId === 'all') return true;
    const v = (value || '').toLowerCase();
    return (CATEGORY_ALIASES[selectedId] || [selectedId]).includes(v);
  };

  const buildServiceImage = (service) => {
    const raw = (service?.image || '').trim();
    console.log('Service image raw:', raw, 'for service:', service?.title);
    if (!raw) return getPlaceholderImage(service?.category, service?._id);
    if (raw.startsWith('data:')) return raw; 
    if (raw.includes('://')) return raw; 
    return raw || getPlaceholderImage(service?.category, service?._id);
  };

  const getPlaceholderImage = (category, seed) => {
    const id = normalizeCategoryId(category);
    const colors = {
      'aesthetic': ['#ff6b9d', '#ff8fab'],
      'dental': ['#4ecdc4', '#44a08d'],
      'hair care': ['#f093fb', '#f5576c'],
      'dermatology': ['#4facfe', '#00f2fe']
    };
    const colorSet = colors[id] || colors['aesthetic'];
    if (!seed) return `data:image/svg+xml;base64,${btoa(`<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colorSet[0]};stop-opacity:1" /><stop offset="100%" style="stop-color:${colorSet[1]};stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad)"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">${id.toUpperCase()}</text></svg>`)}`;
    const hash = String(seed).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const colorIndex = hash % colorSet.length;
    return `data:image/svg+xml;base64,${btoa(`<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colorSet[colorIndex]};stop-opacity:1" /><stop offset="100%" style="stop-color:${colorSet[(colorIndex + 1) % colorSet.length]};stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad)"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">${id.toUpperCase()}</text></svg>`)}`;
  };

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'aesthetic', name: 'Aesthetic Medicine' },
    { id: 'dental', name: 'Dental Care' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'hair care', name: 'Hair care' }
  ];
  
  const allServices = adminServices;
  
  const filteredServices = allServices.filter(service => isInSelectedCategory(selectedCategory, service.category));
  
  return (
    <div className="min-h-screen">
      <div className="relative bg-cover bg-center h-screen" style={{ backgroundImage: "url('https://i.pinimg.com/736x/04/7c/94/047c9431d661625f3e084a087d3e98fb.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>
        <div className="relative py-40 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-pink-300 to-blue-300 bg-clip-text text-transparent"> OUR SERVICES</span>
              </h1>
              <p className="text-xl text-white mb-9 max-w-3xl mx-auto">
                We believe everyone deserves to feel confident and radiant in their own skin. We offer personalized treatments
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-t from-cyan-100 to-[#BBDCE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-500 mb-8">
              You bring the concern ... Doctor bring the care
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-medical-pink to-medical-blue text-white shadow-lg shadow-medical-pink/20'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-medical-blue/30'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-medical-blue border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading services...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-slate-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-medical-blue/10 group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={buildServiceImage(service)}
                      alt={service.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                       onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getPlaceholderImage(service.category, service.id);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Link
                      to="/book-appointment"
                      className="text-medical-blue font-semibold hover:text-medical-pink transition-colors inline-flex items-center group"
                    >
                      Book Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 py-12 bg-gradient-to-b from-cyan-100 to-zinc-300 rounded-2xl shadow-lg">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                <span className="bg-gradient-to-r from-zinc-500 to-cyan-300 bg-clip-text text-transparent">Looking for something special?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Let's talk about your unique beauty goals
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/book-appointment"
                  className="bg-gradient-to-r from-zinc-400 to-medical-blue text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center group"
                >
                  Let's Talk
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/gallery"
                  className="bg-white text-medical-blue border-2 border-medical-blue px-8 py-3 rounded-lg font-semibold hover:bg-medical-blue/5 transition-all duration-300"
                >
                  See Our Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
