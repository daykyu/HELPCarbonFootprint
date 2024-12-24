import React, { useState, useEffect } from 'react';
import { Search, Heart } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Learn = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState({
    featured: [],
    recent: [],
    favorites: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/content/public', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          category: activeCategory !== 'all' ? activeCategory : '',
          search: searchQuery
        }
      });

      if (response.data.success) {
        const allContent = response.data.data;
        setContent(prev => ({
          ...prev,
          featured: allContent.filter(item => item.featured),
          recent: allContent.filter(item => !item.featured)
        }));
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteContent = async () => {
    if (activeCategory !== 'all') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/content/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setContent(prev => ({
          ...prev,
          favorites: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching favorite content:', error);
    }
  };

  useEffect(() => {
    fetchContent();
    if (activeCategory === 'all') {
      fetchFavoriteContent();
    }
  }, [activeCategory, searchQuery]);

  // Regular content card without heart icon
  const ContentCard = ({ item }) => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/learn/${item._id}`)}
      data-testid="content-card"
    >
      <div className="relative">
        <img
          src={`http://localhost:5000${item.thumbnailUrl}`}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full capitalize">
            {item.category}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {item.description}
        </p>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          aria-label={item.category === 'videos' ? 'Watch video' : 'Read article'}
        >
          {item.category === 'videos' ? 'Watch' : 'Read More'}
        </button>
      </div>
    </div>
  );

  // Favorite card with heart icon
  const FavoriteCard = ({ item }) => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/learn/${item._id}`)}
      data-testid="favorite-card"
    >
      <div className="relative">
        <img
          src={`http://localhost:5000${item.thumbnailUrl}`}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-red-500">
          <Heart className="w-5 h-5 fill-current" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full capitalize">
            {item.category}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {item.description}
        </p>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          aria-label={item.category === 'videos' ? 'Watch video' : 'Read article'}
        >
          {item.category === 'videos' ? 'Watch' : 'Read More'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Search and Category Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            data-testid="search-input"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Categories */}
        <div className="flex justify-end space-x-2">
          {['all', 'articles', 'videos', 'infographics'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              data-testid={`filter-${category}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {activeCategory === 'all' 
            ? 'Recommended Content' 
            : `Recommended ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.recent
            .filter(item => activeCategory === 'all' || item.category === activeCategory)
            .map(item => (
              <ContentCard key={item._id} item={item} />
            ))}
        </div>
      </div>

      {/* Favorites Content - Only show on 'all' category */}
      {activeCategory === 'all' && content.favorites.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Favorite Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.favorites.map(item => (
              <FavoriteCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;