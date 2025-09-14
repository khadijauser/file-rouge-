import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { galleryAPI, assetUrl } from '../api';
import { useAuth } from '../context/AuthContext';

const getImageUrl = (path, id, which) => {
  if (!path || typeof path !== 'string') return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;

  if (id && which) return assetUrl(`/api/gallery/${id}/${which}`);
  return path;
};

const Gallery = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const res = await galleryAPI.getPublic();
        const items = res.galleryItems || [];
        setGalleryItems(items);
      } catch (err) {
        setError(err.message || 'Failed to load gallery items');
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryItems();
  }, []);


  const categories = [
    { id: 'all', name: 'All Results' },
    { id: 'aesthetic', name: 'Aesthetic Medicine' },
    { id: 'dental', name: 'Dental Care' },
    { id: 'dermatology', name: 'Dermatology' }
  ];
  
  const getCategoryFromTreatmentType = (treatmentType) => {
    if (!treatmentType) return 'all';
    
    const type = treatmentType.toLowerCase();
    
    if (type.includes('aesthetic') || type.includes('botox') || type.includes('filler') || 
        type.includes('chemical') || type.includes('laser') || type.includes('plastic')) {
      return 'aesthetic';
    }
    if (type.includes('dental') || type.includes('tooth') || type.includes('teeth')) {
      return 'dental';
    }
    if (type.includes('dermatology') || type.includes('skin') || type.includes('acne')) {
      return 'dermatology';
    }
    
    return 'all';
  };

  const filteredItems = galleryItems.filter(item => {
    if (!item) return false;
    
    const itemCategory = getCategoryFromTreatmentType(item.treatmentType);
    const matchesCategory = selectedCategory === 'all' || itemCategory === selectedCategory;
    
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.treatmentType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <div className="relative bg-cover bg-center h-[100vh]" style={{ backgroundImage: "url('https://i.pinimg.com/1200x/e3/49/0d/e3490dd1bf0fcbcfac8b3914be489103.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>
        <section className="relative py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                
                <span className="bg-gradient-to-r from-pink-300 to-blue-300 bg-clip-text text-transparent">OUR GALLERY</span>
              </h1>
              <p className="text-xl text-white mb-18 max-w-3xl mx-auto">
Discover our collection of real before-and-after transformations, showcasing the remarkable results and lasting impact of our treatments.</p>
            </div>
          </div>
        </section>
      </div>

      
      <div className="py-20 relative bg-gradient-to-t from-stone-300 to-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {user && (user.role === 'doctor' || user.role === 'admin') && (
          <div className="mb-8 p-6 backdrop-blur-md rounded-xl shadow-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">Gallery Management</h2>
            <p className="text-white/80 mb-4"> Manage your gallery items from the doctor dashboard.</p>
            <Link 
              to="/doctor-dashboard" 
              className="bg-gradient-to-r from-medical-pink to-medical-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-medical-pink/20 transition-all duration-300 inline-flex items-center"
            >
              <span className="mr-2">Go to Gallery Management</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Results <span className="bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            See real results from our patients who trusted us with their transformation journey
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-pink focus:border-medical-pink text-white placeholder-white/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-medical-pink to-medical-blue text-white shadow-lg shadow-medical-pink/20'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
            <p className="text-white/70">Loading gallery items...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:shadow-medical-pink/10 transition-all duration-300 cursor-pointer border border-white/10 group flex flex-col h-full"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="relative overflow-hidden">
                        <img
                          src={getImageUrl(item.beforeImage, item._id, 'before')}
                          alt="Before"
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJlZm9yZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-medical-pink to-medical-blue text-white px-2 py-1 rounded text-xs">
                          Before
                        </div>
                      </div>
                      <div className="relative overflow-hidden">
                        <img
                          src={getImageUrl(item.afterImage, item._id, 'after')}
                          alt="After"
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFmdGVyPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-medical-blue to-medical-pink text-white px-2 py-1 rounded text-xs">
                          After
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-medical-pink transition-colors duration-300">{item.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getCategoryFromTreatmentType(item.treatmentType) === 'aesthetic' ? 'bg-medical-pink/20 text-medical-pink' : 
                        getCategoryFromTreatmentType(item.treatmentType) === 'dental' ? 'bg-blue-500/20 text-blue-300' : 
                        getCategoryFromTreatmentType(item.treatmentType) === 'dermatology' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {categories.find(cat => cat.id === getCategoryFromTreatmentType(item.treatmentType))?.name || 'General'}
                      </span>
                    </div>
                    <p className="text-white/70 mb-3 flex-grow">{item.description}</p>
                    <div className="flex justify-between items-center text-sm text-white/60 mt-auto">
                      <span>{item.doctor?.name || 'Unknown Doctor'}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                <div className="max-w-md mx-auto">
                  <div className="text-white/40 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {galleryItems.length === 0 ? 'No Gallery Items Yet' : 'No Results Found'}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {galleryItems.length === 0 ? (
                      user && (user.role === 'doctor' || user.role === 'admin') 
                        ? 'Upload some before/after images to showcase your work.'
                        : 'Check back soon to see our treatment results and transformations.'
                    ) : (
                      'No results found matching your search criteria. Try adjusting your filters.'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-black/90 to-medical-blue/30 backdrop-blur-md rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/10">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        <span className="bg-gradient-to-r from-medical-pink to-medical-blue bg-clip-text text-transparent">{selectedImage.title}</span>
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getCategoryFromTreatmentType(selectedImage.treatmentType) === 'aesthetic' ? 'bg-medical-pink/20 text-medical-pink' : 
                        getCategoryFromTreatmentType(selectedImage.treatmentType) === 'dental' ? 'bg-blue-500/20 text-blue-300' : 
                        getCategoryFromTreatmentType(selectedImage.treatmentType) === 'dermatology' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {categories.find(cat => cat.id === getCategoryFromTreatmentType(selectedImage.treatmentType))?.name || 'General'}
                      </span>
                    </div>
                    <p className="text-white/80">{selectedImage.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-white">Before</h4>
                    <div className="relative overflow-hidden rounded-lg group">
                      <img 
                        src={getImageUrl(selectedImage.beforeImage)} 
                        alt="Before"
                        className="w-full h-auto max-h-[65vh] rounded-lg transition-transform duration-500 group-hover:scale-105 object-contain"
                      />
                      
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-white">After</h4>
                    <div className="relative overflow-hidden rounded-lg group">
                      <img 
                        src={getImageUrl(selectedImage.afterImage)} 
                        alt="After"
                        className="w-full h-auto max-h-[65vh] rounded-lg transition-transform duration-500 group-hover:scale-105 object-contain"
                      />
                     
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center text-white/70 bg-white/5 p-3 rounded-lg">
                  <span className="font-medium">{selectedImage.doctor?.name || 'Unknown Doctor'}</span>
                  <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-16 bg-gradient-to-r from-medical-pink to-medical-blue text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready for Your Transformation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book a consultation and start your journey to looking and feeling your best
          </p>
          <Link to="/book-appointment" className="inline-block bg-white text-medical-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Schedule Consultation
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;