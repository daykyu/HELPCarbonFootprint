import React, { useState } from 'react';
import { 
  User,
  Shield,
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  Upload
} from 'lucide-react';
import axios from 'axios';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [settings, setSettings] = useState({
    profile: {
      username: 'admin',
      email: 'admin123@gmail.com',
      phone: '085864886366',
      avatar: '/src/assets/Profile4.png'
    },
    security: {
      passwordExpiry: 90,
      mfaRequired: true,
      sessionTimeout: 30
    },
    system: {
      maintenanceMode: false,
      automaticBackup: true,
      systemLogs: true
    }
  });
  const [avatar, setAvatar] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          content: 'Image size should be less than 2MB'
        });
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const TabButton = ({ id, icon: Icon, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
        ${active 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-gray-600 hover:bg-gray-50'
        }`}
      data-testid={`tab-${id}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (avatar) {
        formData.append('avatar', avatar);
      }
      formData.append('settings', JSON.stringify(settings));

      await axios.put(
        'http://localhost:5000/api/admin/settings',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setMessage({
        type: 'success',
        content: 'Settings updated successfully'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to update settings'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <TabButton 
              id="profile" 
              icon={User} 
              label="Profile" 
              active={activeTab === 'profile'} 
            />
            <TabButton 
              id="security" 
              icon={Shield} 
              label="Security" 
              active={activeTab === 'security'} 
            />
            <TabButton 
              id="system" 
              icon={SettingsIcon} 
              label="System" 
              active={activeTab === 'system'} 
            />
          </div>
        </div>

        {/* Settings Forms */}
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6" data-testid="profile-settings">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <img 
                    src={settings.profile.avatar} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                      data-testid="avatar-input"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500">JPG or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={settings.profile.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    data-testid="username-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    data-testid="email-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    data-testid="phone-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6" data-testid="security-settings">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    data-testid="password-expiry-input"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Require MFA
                    </label>
                    <p className="text-sm text-gray-500">
                      Require multi-factor authentication for all admins
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={settings.security.mfaRequired}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, mfaRequired: e.target.checked }
                      }))}
                      id="mfa-toggle"
                      data-testid="mfa-toggle"
                    />
                    <label
                      htmlFor="mfa-toggle"
                      className={`absolute cursor-pointer inset-0 rounded-full transition duration-300 ease-in-out ${
                        settings.security.mfaRequired ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                          settings.security.mfaRequired ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    data-testid="session-timeout-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6" data-testid="system-settings">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Maintenance Mode
                    </label>
                    <p className="text-sm text-gray-500">
                      Put the system in maintenance mode. Only admins can access.
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={settings.system.maintenanceMode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, maintenanceMode: e.target.checked }
                      }))}
                      id="maintenance-toggle"
                      data-testid="maintenance-mode-toggle"
                    />
                    <label
                      htmlFor="maintenance-toggle"
                      className={`absolute cursor-pointer inset-0 rounded-full transition duration-300 ease-in-out ${
                        settings.system.maintenanceMode ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                          settings.system.maintenanceMode ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Automatic Backup
                    </label>
                    <p className="text-sm text-gray-500">
                      Enable automatic daily backup of system data
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={settings.system.automaticBackup}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, automaticBackup: e.target.checked }
                      }))}
                      id="backup-toggle"
                      data-testid="backup-toggle"
                    />
                    <label
                      htmlFor="backup-toggle"
                      className={`absolute cursor-pointer inset-0 rounded-full transition duration-300 ease-in-out ${
                        settings.system.automaticBackup ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                          settings.system.automaticBackup ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      System Logs
                    </label>
                    <p className="text-sm text-gray-500">
                      Enable detailed system activity logging
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={settings.system.systemLogs}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, systemLogs: e.target.checked }
                      }))}
                      id="logs-toggle"
                      data-testid="logs-toggle"
                    />
                    <label
                      htmlFor="logs-toggle"
                      className={`absolute cursor-pointer inset-0 rounded-full transition duration-300 ease-in-out ${
                        settings.system.systemLogs ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                          settings.system.systemLogs ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </label>
                  </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          {message.content && (
            <div 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg
                ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              data-testid="settings-message"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{message.content}</span>
            </div>
          )}
          <div className="flex space-x-4 ml-auto">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
              data-testid="reset-settings"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
              disabled={loading}
              data-testid="save-settings"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;