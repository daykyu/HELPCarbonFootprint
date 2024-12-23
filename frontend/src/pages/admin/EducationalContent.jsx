import React, { useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';

const EducationalContent = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [view, setView] = useState('upload'); // 'upload' or 'published'
  const [formData, setFormData] = useState({
    title: '',
    category: 'videos',
    description: '',
    file: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate success for now
    setShowSuccessModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, file }));
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          You have successfully uploaded an Educational Content!
        </h3>
        <button
          onClick={() => setShowSuccessModal(false)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          id="closeSuccessModal"
        >
          Close
        </button>
      </div>
    </div>
  );

  const NavigationTabs = () => (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setView('upload')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          view === 'upload'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        id="uploadTabButton"
      >
        Upload Content
      </button>
      <button
        onClick={() => setView('published')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          view === 'published'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        id="publishedTabButton"
      >
        Published Content
      </button>
    </div>
  );

  const UploadForm = () => (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Upload an Educational Content</h2>
      <form onSubmit={handleSubmit} className="space-y-6" id="uploadContentForm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Title of Educational Content"
            required
            id="contentTitle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value="videos"
                checked={formData.category === 'videos'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-4 h-4 text-indigo-600"
                id="categoryVideos"
              />
              <span className="ml-2 text-gray-700">Videos</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value="articles"
                checked={formData.category === 'articles'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-4 h-4 text-indigo-600"
                id="categoryArticles"
              />
              <span className="ml-2 text-gray-700">Articles</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value="infographics"
                checked={formData.category === 'infographics'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-4 h-4 text-indigo-600"
                id="categoryInfographics"
              />
              <span className="ml-2 text-gray-700">Infographics</span>
            </label>
          </div>
        </div>

        {formData.category === 'videos' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Browse File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      id="fileUpload"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">MP4, WebM up to 10MB</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
            placeholder="Description of Educational Content"
            required
            id="contentDescription"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            id="uploadButton"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Content</span>
          </button>
        </div>
      </form>
    </div>
  );

  const PublishedContent = () => (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Published Content</h2>
        <button
          onClick={() => setView('upload')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          id="newContentButton"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Content</span>
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between" id="contentItem">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {/* Placeholder for content thumbnail */}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Understanding Carbon Footprint</h3>
              <p className="text-sm text-gray-500">Article • Published on Dec 1, 2023</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-blue-600 bg-blue-50 rounded-lg text-sm hover:bg-blue-100 transition-colors"
              id="editButton"
            >
              Edit
            </button>
            <button
              className="px-3 py-1 text-red-600 bg-red-50 rounded-lg text-sm hover:bg-red-100 transition-colors"
              id="deleteButton"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <NavigationTabs />
      {view === 'upload' ? <UploadForm /> : <PublishedContent />}
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default EducationalContent;