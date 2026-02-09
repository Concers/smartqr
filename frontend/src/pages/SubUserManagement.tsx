import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, UserCheck, UserX, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import subUserService, { SubUser, SubUserPermissions, CreateSubUserData, UpdateSubUserData, SubUserService } from '../services/subUserService';
import { useAuth } from '../hooks/useAuth';

const SubUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { canManageSubUsers } = useAuth();
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubUser, setSelectedSubUser] = useState<SubUser | null>(null);
  const [formData, setFormData] = useState<CreateSubUserData>({
    email: '',
    password: '',
    name: '',
    permissions: SubUserService.getDefaultPermissions(),
  });

  useEffect(() => {
    // Check if user can manage sub-users
    if (!canManageSubUsers()) {
      navigate('/admin');
      return;
    }
    loadSubUsers();
  }, []); // Remove dependencies to prevent infinite loop

  const loadSubUsers = async () => {
    try {
      setLoading(true);
      const data = await subUserService.getSubUsers();
      setSubUsers(data.subUsers);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading sub-users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subUserService.createSubUser(formData);
      setShowCreateModal(false);
      resetForm();
      loadSubUsers();
    } catch (error: any) {
      console.error('Error creating sub-user:', error);
      window.alert(error.response?.data?.error || 'Alt kullanıcı oluşturulamadı');
    }
  };

  const handleUpdateSubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubUser) return;

    try {
      const updateData: UpdateSubUserData = {
        email: formData.email,
        name: formData.name,
        permissions: formData.permissions,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await subUserService.updateSubUser(selectedSubUser.id, updateData);
      setShowEditModal(false);
      resetForm();
      loadSubUsers();
    } catch (error: any) {
      console.error('Error updating sub-user:', error);
      window.alert(error.response?.data?.error || 'Alt kullanıcı güncellenemedi');
    }
  };

  const handleDeleteSubUser = async (id: string) => {
    if (!window.confirm('Bu alt kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      await subUserService.deleteSubUser(id);
      loadSubUsers();
    } catch (error: any) {
      console.error('Error deleting sub-user:', error);
      window.alert(error.response?.data?.error || 'Alt kullanıcı silinemedi');
    }
  };

  const handleToggleActive = async (subUser: SubUser) => {
    try {
      await subUserService.updateSubUser(subUser.id, { isActive: !subUser.isActive });
      loadSubUsers();
    } catch (error: any) {
      console.error('Error toggling sub-user status:', error);
      window.alert(error.response?.data?.error || 'Durum güncellenemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      permissions: SubUserService.getDefaultPermissions(),
    });
    setSelectedSubUser(null);
  };

  const openEditModal = (subUser: SubUser) => {
    setSelectedSubUser(subUser);
    setFormData({
      email: subUser.email,
      password: '',
      name: subUser.name || '',
      permissions: subUser.permissions,
    });
    setShowEditModal(true);
  };

  const handlePermissionChange = (permission: keyof SubUserPermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alt Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">Hesabınıza alt kullanıcılar ekleyin ve yetkilerini yönetin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Alt Kullanıcı</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pasif</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Alt Kullanıcı Ekle
        </button>
      </div>

      {/* SubUsers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Yetkiler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Giriş
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subUsers.map((subUser) => (
              <tr key={subUser.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{subUser.name || subUser.email}</div>
                    <div className="text-sm text-gray-500">{subUser.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    subUser.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subUser.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {Object.entries(subUser.permissions)
                      .filter(([_, enabled]) => enabled)
                      .map(([permission]) => SubUserService.getPermissionLabels()[permission as keyof SubUserPermissions])
                      .join(', ') || 'Yetki yok'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subUser.lastLoginAt 
                    ? new Date(subUser.lastLoginAt).toLocaleDateString('tr-TR')
                    : 'Hiç giriş yapmadı'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEditModal(subUser)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(subUser)}
                    className={`mr-3 ${subUser.isActive ? 'text-yellow-600' : 'text-green-600'}`}
                  >
                    {subUser.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteSubUser(subUser.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Alt Kullanıcı Ekle</h2>
            <form onSubmit={handleCreateSubUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yetkiler
                </label>
                <div className="space-y-2">
                  {Object.entries(SubUserService.getPermissionLabels()).map(([permission, label]) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions[permission as keyof SubUserPermissions]}
                        onChange={(e) => handlePermissionChange(permission as keyof SubUserPermissions, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSubUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Alt Kullanıcı Düzenle</h2>
            <form onSubmit={handleUpdateSubUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (İsteğe Bağlı)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Değiştirmek için boş bırakın"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yetkiler
                </label>
                <div className="space-y-2">
                  {Object.entries(SubUserService.getPermissionLabels()).map(([permission, label]) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions[permission as keyof SubUserPermissions]}
                        onChange={(e) => handlePermissionChange(permission as keyof SubUserPermissions, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubUserManagement;
