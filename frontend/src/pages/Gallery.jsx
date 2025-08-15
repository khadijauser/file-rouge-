import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { galleryAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://localhost:5000';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('/uploads/')) return BACKEND_URL + path;
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [title, setTitle] = useState('');
  const [treatmentType, setTreatmentType] = useState('');

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const res = await galleryAPI.getPublic();
        console.log('Gallery items fetched:', res);
        setGalleryItems(res.galleryItems || []);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError(err.message || 'Failed to load gallery items');
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryItems();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('treatmentType', treatmentType);
      formData.append('beforeImage', beforeFile);
      formData.append('afterImage', afterFile);
      const token = localStorage.getItem('medibeauty_token');
      const res = await fetch(BACKEND_URL + '/api/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadSuccess('Upload successful!');
        setTitle('');
        setTreatmentType('');
        setBeforeFile(null);
        setAfterFile(null);
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Results' },
    { id: 'aesthetic', name: 'Aesthetic Medicine' },
    { id: 'dental', name: 'Dental Care' },
    { id: 'dermatology', name: 'Dermatology' }
  ];

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.treatmentType.toLowerCase() === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {user && (user.role === 'doctor' || user.role === 'admin') && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Upload Gallery Images</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Treatment Type"
                value={treatmentType}
                onChange={e => setTreatmentType(e.target.value)}
                required
                className="border p-2 rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => setBeforeFile(e.target.files[0])}
                required
                className="border p-2 rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => setAfterFile(e.target.files[0])}
                required
                className="border p-2 rounded"
              />
              <button
                type="submit"
                disabled={uploading}
                className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              {uploadError && <div className="text-red-600">{uploadError}</div>}
              {uploadSuccess && <div className="text-green-600">{uploadSuccess}</div>}
            </form>
          </div>
        )}
        {/* Message for patients */}
        {user && user.role === 'patient' && (
          <div className="mb-8 p-6 bg-yellow-50 rounded-xl shadow text-yellow-800">
            Only doctors and admins can upload before/after images to the gallery.
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Results Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See real results from our patients who trusted us with their transformation journey
          </p>
        </div>
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-sky-50 hover:text-sky-600 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery items...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="relative">
                        <img
                          src={getImageUrl(item.beforeImage)}
                          alt="Before"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=Before+Image';
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          Before
                        </div>
                      </div>
                      <div className="relative">
                        <img
                          src={getImageUrl(item.afterImage)}
                          alt="After"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=After+Image';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-sky-600 text-white px-2 py-1 rounded text-xs">
                          After
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{item.doctor?.name || 'Unknown Doctor'}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Gallery Items Yet</h3>
                  <p className="text-gray-600 mb-4">
                    {user && (user.role === 'doctor' || user.role === 'admin') 
                      ? 'Upload some before/after images to showcase your work.'
                      : 'Check back soon to see our treatment results and transformations.'
                    }
                  </p>
                  {user && (user.role === 'doctor' || user.role === 'admin') && (
                    <button
                      onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Upload First Image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No results found matching your criteria</p>
          </div>
        )}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedImage.title}</h3>
                    <p className="text-gray-600">{selectedImage.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Before</h4>
                    <img 
                      src={getImageUrl(selectedImage.beforeImage)} 
                      alt="Before"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">After</h4>
                    <img 
                      src={getImageUrl(selectedImage.afterImage)} 
                      alt="After"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center text-gray-600">
                  <span className="font-medium">{selectedImage.doctor?.name || 'Unknown Doctor'}</span>
                  <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-16 bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready for Your Transformation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book a consultation and start your journey to looking and feeling your best
          </p>
          <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Schedule Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;