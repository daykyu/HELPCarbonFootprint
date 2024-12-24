import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, FileText, Video, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const EditContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null,
    thumbnail: null
  });
  const [currentFile, setCurrentFile] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState(null);

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'articles': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'videos': return <Video className="w-5 h-5 text-purple-500" />;
      case 'infographics': return <ImageIcon className="w-5 h-5 text-pink-500" />;
      default: return null;
    }
  };

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/content/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const { title, category, description, fileUrl, fileName, thumbnailUrl } = response.data.data;
        setFormData({ title, category, description });
        setCurrentFile({ url: fileUrl, name: fileName });
        setCurrentThumbnail(thumbnailUrl);
        setThumbnailPreview(`http://localhost:5000${thumbnailUrl}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'content') {
      const maxSize = formData.category === 'videos' ? 100 : 
                     formData.category === 'articles' ? 10 : 5;
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    } else if (type === 'thumbnail') {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for thumbnails
        alert('Thumbnail size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const getFileTypeText = () => {
    switch(formData.category) {
      case 'videos': return 'MP4, WebM, AVI (max. 100MB)';
      case 'articles': return 'PDF, DOC, DOCX (max. 10MB)';
      case 'infographics': return 'PNG, JPG, SVG (max. 5MB)';
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formPayload = new FormData();
      
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      
      if (formData.file) {
        formPayload.append('file', formData.file);
      }
      
      if (formData.thumbnail) {
        formPayload.append('thumbnail', formData.thumbnail);
      }

      await axios.put(
        `http://localhost:5000/api/content/${id}`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      navigate('/admin/educational');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating content');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Edit Educational Content</h2>
            <button
              onClick={() => navigate('/admin/educational')}
              className="text-gray-500 hover:text-gray-700"
              data-testid="close-edit-form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 border-l-4 border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                data-testid="edit-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(formData.category)}
                  <span className="text-gray-700 capitalize">{formData.category}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Category cannot be changed after content creation. Create new content if you need to change the category.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32"
                data-testid="edit-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Content File Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content File
                </label>
                <div className="space-y-4">
                  {currentFile && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(formData.category)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current file:</p>
                            <a 
                              href={`http://localhost:5000${currentFile.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              {currentFile.name}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload new file</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'content')}
                            accept={formData.category === 'videos' ? 'video/*' : 
                                   formData.category === 'articles' ? '.pdf,.doc,.docx' : 
                                   'image/*'}
                            data-testid="edit-file"
                          />
                        </label>
                        <span className="pl-1">or drag and drop</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>{getFileTypeText()}</p>
                        {formData.file && (
                          <p className="text-indigo-600 mt-1">Selected: {formData.file.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                <div className="space-y-4">
                  {thumbnailPreview && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col items-center">
                        <img
                          src={thumbnailPreview}
                          alt="Content thumbnail"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <p className="mt-2 text-sm text-gray-500">Current thumbnail</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                    <div className="space-y-2 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload new thumbnail</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                            accept="image/*"
                            data-testid="edit-thumbnail"
                          />
                        </label>
                        <span className="pl-1">or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </p>
                      {formData.thumbnail && (
                        <p className="text-indigo-600 mt-1">Selected: {formData.thumbnail.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/educational')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                data-testid="cancel-edit"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                data-testid="submit-edit"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditContent;