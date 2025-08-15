import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, DollarSign, ArrowRight } from 'lucide-react';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const services = [
    {
      id: 1,
      category: 'aesthetic',
      title: 'Botox Treatment',
      description: 'Reduce fine lines and wrinkles with professional botox injections',
      price: '$300 - $500',
      duration: '30-45 minutes',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/3985360/pexels-photo-3985360.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      category: 'aesthetic',
      title: 'Dermal Fillers',
      description: 'Restore volume and enhance facial contours naturally',
      price: '$400 - $800',
      duration: '45-60 minutes',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      category: 'aesthetic',
      title: 'Chemical Peel',
      description: 'Improve skin texture and reduce signs of aging',
      price: '$150 - $300',
      duration: '60 minutes',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      category: 'dental',
      title: 'Teeth Whitening',
      description: 'Professional whitening for a brighter, confident smile',
      price: '$200 - $400',
      duration: '60-90 minutes',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/3845623/pexels-photo-3845623.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      category: 'dental',
      title: 'Dental Implants',
      description: 'Permanent solution for missing teeth',
      price: '$1500 - $3000',
      duration: '2-3 hours',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/6528041/pexels-photo-6528041.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 6,
      category: 'dental',
      title: 'Invisalign',
      description: 'Clear aligners for straight teeth without traditional braces',
      price: '$3000 - $5000',
      duration: '12-18 months',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/6627528/pexels-photo-6627528.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 7,
      category: 'dermatology',
      title: 'Laser Hair Removal',
      description: 'Permanent hair reduction with advanced laser technology',
      price: '$100 - $300',
      duration: '30-60 minutes',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/7755171/pexels-photo-7755171.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 8,
      category: 'dermatology',
      title: 'Acne Treatment',
      description: 'Comprehensive acne treatment and skin care',
      price: '$150 - $250',
      duration: '45 minutes',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/5069408/pexels-photo-5069408.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'aesthetic', name: 'Aesthetic Medicine' },
    { id: 'dental', name: 'Dental Care' },
    { id: 'dermatology', name: 'Dermatology' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional medical and aesthetic treatments with expert care and proven results
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-sky-50 hover:text-sky-600 border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{service.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    {service.price}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    {service.duration}
                  </div>
                </div>
                
                <Link
                  to="/book-appointment"
                  className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors inline-flex items-center justify-center text-sm font-medium"
                >
                  Book Appointment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't See What You're Looking For?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us for a personalized consultation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-appointment"
              className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link
              to="/gallery"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-sky-600 transition-colors"
            >
              View Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;