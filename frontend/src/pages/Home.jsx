import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Star, Shield, Users, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-sky-600" />,
      title: "Easy Booking",
      description: "Schedule appointments with just a few clicks"
    },
    {
      icon: <Star className="w-8 h-8 text-sky-600" />,
      title: "Expert Professionals",
      description: "Certified doctors and specialists"
    },
    {
      icon: <Shield className="w-8 h-8 text-sky-600" />,
      title: "Secure & Private",
      description: "Your data is protected with advanced security"
    },
    {
      icon: <Users className="w-8 h-8 text-sky-600" />,
      title: "Patient-Centered",
      description: "Personalized care for every individual"
    }
  ];

  const services = [
    {
      title: "Aesthetic Medicine",
      description: "Advanced cosmetic treatments for natural beauty enhancement",
      image: "https://images.pexels.com/photos/3985360/pexels-photo-3985360.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Dental Care",
      description: "Comprehensive dental services from cleaning to cosmetic dentistry",
      image: "https://images.pexels.com/photos/3845623/pexels-photo-3845623.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Dermatology",
      description: "Professional skin care and treatment solutions",
      image: "https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Beauty & Health
              <span className="block bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                Journey Starts Here
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional medical and aesthetic treatments with expert care. 
              Book appointments, view results, and transform your confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/book-appointment"
                  className="bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors inline-flex items-center justify-center"
                >
                  Book Appointment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors inline-flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
              <Link
                to="/gallery"
                className="border-2 border-sky-600 text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-sky-600 hover:text-white transition-colors"
              >
                View Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MediBeauty Vision?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with personalized care to deliver exceptional results
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive medical and aesthetic treatments tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link 
                    to="/services" 
                    className="text-sky-600 font-semibold hover:text-sky-700 inline-flex items-center"
                  >
                    Learn More
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-sky-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sky-100">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sky-100">Expert Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-sky-100">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-sky-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied patients who have achieved their beauty and health goals with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? "/book-appointment" : "/register"}
              className="bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors inline-flex items-center justify-center"
            >
              {user ? "Book Now" : "Join Today"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/gallery"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-sky-600 hover:text-sky-600 transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;