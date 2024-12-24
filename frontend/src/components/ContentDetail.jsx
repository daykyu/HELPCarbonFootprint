import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Heart } from 'lucide-react';
import axios from 'axios';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchContentDetail();
    checkFavoriteStatus();
  }, [id]);

  const fetchContentDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/content/public/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setContent(response.data.data);
      }
    } catch (error) {
      setError('Failed to load content');
      console.error('Error fetching content detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/content/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const favorites = response.data.data;
        setIsFavorited(favorites.some(fav => fav._id === id));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/content/${id}/favorite`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Content not found'}</p>
        <button 
          onClick={() => navigate('/learn')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Return to Learn
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => navigate('/learn')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Learn
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-full capitalize">
                  {content.category}
                </span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <User className="w-4 h-4" />
                <span>{content.createdBy?.username || 'Admin'}</span>
              </div>
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  isFavorited ? 'text-red-500' : 'text-gray-400'
                }`}
                data-testid="favorite-button"
              >
                <Heart 
                  className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {content.category === 'videos' && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-8">
                <video
                  key={content.fileUrl}
                  controls
                  className="w-full h-full"
                  poster={`http://localhost:5000${content.thumbnailUrl}`}
                  data-testid="video-player"
                >
                  <source src={`http://localhost:5000${content.fileUrl}`} type={content.fileType} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {content.category === 'articles' && (
              <div className="prose max-w-none mb-8">
                <img
                  src={`http://localhost:5000${content.thumbnailUrl}`}
                  alt={content.title}
                  className="w-full rounded-lg mb-6"
                />
                <div 
                  className="article-content break-words"
                  dangerouslySetInnerHTML={{ __html: content.fileContent }}
                />
              </div>
            )}

            {content.category === 'infographics' && (
              <div className="flex justify-center mb-8">
                <img
                  src={`http://localhost:5000${content.fileUrl}`}
                  alt={content.title}
                  className="max-w-full rounded-lg"
                  data-testid="infographic-image"
                />
              </div>
            )}

            {/* Description Section with improved text wrapping */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">You Need to Know!</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                  {content.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;