import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Star, Shield, Users, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-medical-blue" />,
      title: "Easy Booking",
      description: "Schedule appointments with just a few clicks"
    },
    {
      icon: <Star className="w-8 h-8 text-medical-blue" />,
      title: "Expert Professionals",
      description: "Certified doctors and specialists"
    },
    {
      icon: <Shield className="w-8 h-8 text-medical-green" />,
      title: "Secure & Private",
      description: "Your data is protected with advanced security"
    },
    {
      icon: <Users className="w-8 h-8 text-medical-green" />,
      title: "Patient-Centered",
      description: "Personalized care for every individual"
    }
  ];

  const services = [
    {
      title: "Aesthetic Medicine",
      description: "Advanced cosmetic treatments for natural beauty enhancement",
      image: "https://i.pinimg.com/1200x/15/a1/56/15a156d39c094f31702ceead13593bb7.jpg"
    },
    {
      title: "Dental Care",
      description: "Comprehensive dental services from cleaning to cosmetic dentistry",
      image: "https://i.pinimg.com/736x/c2/4e/08/c24e08a8b07cbe5007d81cb3531a8589.jpg"
    },
    {
      title: "Dermatology",
      description: "Professional skin care and treatment solutions",
      image: "https://i.pinimg.com/736x/2f/49/60/2f4960ceb45303360ce15317e83fe873.jpg"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="relative bg-cover bg-center h-[100vh]" style={{ backgroundImage: "url('https://images.pexels.com/photos/3985318/pexels-photo-3985318.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>
        <section className="relative py-20 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Your Beauty & Health
                <span className="block bg-gradient-to-r from-medical-blue to-medical-pink bg-clip-text text-transparent">
                  Journey Starts Here
                </span>
              </h1>
              <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
                Professional medical and aesthetic treatments with expert care. 
                Book appointments, view results, and transform your confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    to="/book-appointment"
                    className=" border-2 border-white/80 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10  transition-all duration-300 hover:border-medical-blue hover:shadow-medical-pink/20 inline-flex items-center justify-center"
                  >
                    Book Appointment
                    <ArrowRight className="ml-2 w-5 h-5 animate-pulse" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link
                  to="/gallery"
                  className="border-2 border-white/80 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10  transition-all duration-300 hover:border-medical-blue"
                >
                  View Results
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-20 relative bg-gradient-to-t from-cyan-100 to-[#CDC0B0]">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-600 mb-4">
                Why Choose MediBeauty Vision?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto ">
                We combine cutting-edge technology with personalized care to deliver exceptional results
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg hover:shadow-medical-blue/20 transition-all duration-300 border border-medical-blue/10 group">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-medical-blue/20 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
      </section>

      <section className="py-20 relative bg-cyan-100">
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
               <span className="bg-gradient-to-r from-pink-300 to-blue-300 bg-clip-text text-transparent">Our Services</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive medical and aesthetic treatments tailored to your needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-slate-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-medical-pink/20 transition-all duration-300 border border-medical-blue/10 group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Link 
                      to="/services" 
                      className="text-pink-400 font-semibold hover:text-medical-blue transition-colors inline-flex items-center group"
                    >
                      Learn More
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative bg-cyan-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-xl bg-white shadow-md border border-medical-blue/10 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">1000+</div>
              <div className="text-gray-700 font-medium">Happy Patients</div>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-md border border-medical-blue/10 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">50+</div>
              <div className="text-gray-700 font-medium">Expert Doctors</div>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-md border border-medical-blue/10 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">15+</div>
              <div className="text-gray-700 font-medium">Years Experience</div>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-md border border-medical-blue/10 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">98%</div>
              <div className="text-gray-700 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20  bg-gradient-to-b from-cyan-100 to-zinc-300">
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
             <span className="bg-gradient-to-r from-zinc-500 to-cyan-300 bg-clip-text text-transparent">Ready to Transform Your Look?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of satisfied patients who have achieved their beauty and health goals with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? "/book-appointment" : "/register"}
                className="bg-gradient-to-r from-zinc-400 to-medical-blue text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300 inline-flex items-center justify-center group"
              >
                {user ? "Book Now" : "Join Today"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/gallery"
                className="bg-gradient-to-r from-zinc-400 to-medical-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-medical-blue/30 transition-all duration-300 "
              >
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;