import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PublishedContent = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    search: '',
    category: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchContent();
  }, [searchParams]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/content', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchParams.search,
          category: searchParams.category,
          sortBy: searchParams.sortBy
        }
      });

      if (response.data.success) {
        setContent(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/content/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchContent();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting content');
    }
  };

  const handleChange = (e) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Published Content</h2>
          <button
            onClick={() => navigate('/admin/educational/upload')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            data-testid="show-upload-form"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Content</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <form className="mb-6 space-y-4 border-b border-gray-200 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchParams.search}
                  onChange={handleChange}
                  placeholder="Search content..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  data-testid="search-input"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={searchParams.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  data-testid="category-filter"
                >
                  <option value="">All Categories</option>
                  <option value="articles">Articles</option>
                  <option value="videos">Videos</option>
                  <option value="infographics">Infographics</option>
                </select>
              </div>
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={searchParams.sortBy}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  data-testid="date-filter"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {content.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No content found
              </div>
            ) : (
              content.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  data-testid={`content-item-${item._id}`}
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={`http://localhost:5000${item.thumbnailUrl}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)} • 
                      Published on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/educational/edit/${item._id}`)}
                      className="px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      data-testid="edit-content"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      data-testid="delete-content"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishedContent;