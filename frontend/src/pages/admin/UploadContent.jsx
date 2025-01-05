import React, { useState } from 'react';
import { Upload, X, CheckCircle2, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadContent = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'articles',
    description: '',
    file: null,
    thumbnail: null
  });

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
      setFormData({...formData, file: file});
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
      setFormData({...formData, thumbnail: file});
    }
  };

  const getFileTypeText = () => {
    switch(formData.category) {
      case 'videos':
        return 'MP4, WebM, AVI (max. 100MB)';
      case 'articles':
        return 'PDF, DOC, DOCX (max. 10MB)';
      case 'infographics':
        return 'PNG, JPG, SVG (max. 5MB)';
      default:
        return '';
    }
  };

 // Di UploadContent.jsx, update handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('title', formData.title);
    form.append('category', formData.category);
    form.append('description', formData.description);
    form.append('file', formData.file);
    form.append('thumbnail', formData.thumbnail);

    const response = await axios.post('http://localhost:5000/api/content', form, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.data.success) {
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert(error.response?.data?.message || 'Error uploading content');
  }
};


  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="success-modal">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Successfully Uploaded!
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Your educational content has been uploaded successfully.
          </p>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/admin/educational');
            }}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            data-testid="close-success-modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Upload Educational Content</h2>
            <button
              onClick={() => navigate('/admin/educational')}
              className="text-gray-500 hover:text-gray-700"
              data-testid="close-upload-form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                placeholder="Enter content title"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                data-testid="input-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Category
              </label>
              <div className="grid grid-cols-3 gap-6" role="radiogroup">
                {['articles', 'videos', 'infographics'].map((category) => (
                  <label
                    key={category}
                    className={`
                      relative flex items-center justify-center p-4 cursor-pointer
                      border-2 rounded-lg transition-all
                      ${formData.category === category 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-200 hover:border-indigo-200'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={formData.category === category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="absolute opacity-0"
                      data-testid={`radio-${category}`}
                    />
                    <span className="capitalize font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Content Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Content
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload content file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'content')}
                          accept={formData.category === 'videos' ? 'video/*' : 
                                 formData.category === 'articles' ? '.pdf,.doc,.docx' : 
                                 'image/*'}
                          data-testid="content-upload"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">{getFileTypeText()}</p>
                    {formData.file && (
                      <p className="text-indigo-600 mt-1">Selected: {formData.file.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Thumbnail
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                  <div className="space-y-2 text-center">
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto h-32 w-32 object-cover rounded"
                      />
                    ) : (
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload thumbnail</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'thumbnail')}
                          accept="image/*"
                          data-testid="thumbnail-upload"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG (max. 2MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                required
                placeholder="Enter content description"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 h-32"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                data-testid="input-description"
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
                data-testid="submit-upload"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Content</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default UploadContent;