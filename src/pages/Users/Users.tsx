import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { userService, type User } from '../../services';
import { useApi } from '../../hooks';
import { Modal } from '../../components/ui/modal';

export default function Users() {
  const { data: listResponse, loading: listLoading, error: listError, execute: fetchUsers } = useApi(() => userService.getUsers());
  const { loading: upsertLoading, error: upsertError, execute: upsert } = useApi((payload: { email: string; password: string }) => userService.upsertUser(payload));
  const { loading: updateLoading, error: updateError, execute: updatePassword } = useApi((params: { email: string; password: string }) => userService.updatePassword(params.email, { password: params.password }));
  const { loading: deleteLoading, error: deleteError, execute: deleteUser } = useApi((emailParam: string) => userService.deleteUser(emailParam));
  const { execute: connectUser } = useApi((emailParam: string) => userService.connectUser(emailParam));

  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');
  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!listResponse) return;
    const data = (listResponse as any)?.data ?? listResponse;
    if (Array.isArray(data)) {
      setUsers(data as User[]);
    } else if (Array.isArray((data as any)?.data)) {
      setUsers((data as any).data as User[]);
    }
  }, [listResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const res = await upsert({ email, password });
    if (res?.success) {
      setEmail('');
      setPassword('');
      setAddErrors({});
      fetchUsers();
    }
  };

  const openPasswordModal = (emailValue: string) => {
    setSelectedEmail(emailValue);
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleUpdatePassword = async () => {
    const errs: Record<string, string> = {};
    if (!selectedEmail) errs.email = 'Email is required';
    if (!newPassword) errs.password = 'Password is required';
    setUpdateErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const res = await updatePassword({ email: selectedEmail, password: newPassword });
    if (res?.success) {
      setIsModalOpen(false);
      setSelectedEmail('');
      setNewPassword('');
      setUpdateErrors({});
      fetchUsers();
    }
  };

  const openDeleteModal = (emailValue: string) => {
    setSelectedEmail(emailValue);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmail) return;
    const res = await deleteUser(selectedEmail);
    if (res?.success) {
      setIsDeleteModalOpen(false);
      setSelectedEmail('');
      fetchUsers();
    }
  };

  const handleTestName = async (emailValue: string) => {
    setTestingMap(prev => ({ ...prev, [emailValue]: true }));
    const res = await connectUser(emailValue);
    const server = (res?.data as any) || null;
    const successFlag = server?.success === true;
    const msg = server?.message || (successFlag ? 'Connected' : 'Connection failed');
    setBannerType(successFlag ? 'success' : 'error');
    setBannerMessage(String(msg));
    setTimeout(() => setBannerMessage(''), 2500);
    setTestingMap(prev => ({ ...prev, [emailValue]: false }));
  };

  const renderStatus = () => {
    if (listLoading) return <div className="text-gray-500">Loading users...</div>;
    if (listError) return <div className="text-red-600">{listError.message}</div>;
    return null;
  };

  return (
    <>
      <PageMeta title="Users" description="Manage users" />
      <PageBreadcrumb pageTitle="Users" />

      <div className="grid grid-cols-1 gap-6">
        <ComponentCard title="Add or Upsert User">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${addErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                  placeholder="name@example.com"
                />
                {addErrors.email && <p className="mt-1 text-xs text-red-600">{addErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-24 ${addErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    placeholder="Strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {showAddPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {addErrors.password && <p className="mt-1 text-xs text-red-600">{addErrors.password}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={upsertLoading}
                className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 ${upsertLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {upsertLoading ? 'Saving...' : 'Save User'}
              </button>
              {upsertError && <span className="text-red-600 text-sm">{upsertError.message}</span>}
            </div>
          </form>
        </ComponentCard>

        <ComponentCard title="Users List">
          {bannerMessage && (
            <div className={`mb-4 rounded-md px-4 py-3 ${bannerType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {bannerMessage}
            </div>
          )}
          {renderStatus()}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Connection</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'inactive' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.status ? u.status : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openPasswordModal(u.email)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
                      >
                        Update
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDeleteModal(u.email)}
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleTestName(u.email)}
                        disabled={Boolean(testingMap[u.email])}
                        className={`inline-flex items-center rounded-md px-3 py-1.5 ${testingMap[u.email] ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {testingMap[u.email] ? 'Testing...' : 'Test Connection'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !listLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md w-full mx-4 sm:mx-0 p-6">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Update Password</h3>
              <p className="text-sm text-gray-500">{selectedEmail}</p>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative">
              <input
                type={showUpdatePassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-24 ${updateErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="Strong password"
              />
              <button
                type="button"
                onClick={() => setShowUpdatePassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {showUpdatePassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {updateErrors.password && <p className="mt-1 text-xs text-red-600">{updateErrors.password}</p>}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleUpdatePassword}
              disabled={updateLoading}
              className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updateLoading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            {updateError && <span className="text-red-600 text-sm">{updateError.message}</span>}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">Delete User</h3>
          <p className="text-sm text-gray-500 mt-1">{selectedEmail}</p>
          <p className="mt-4 text-sm text-gray-700">This action cannot be undone.</p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className={`inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            {deleteError && <span className="text-red-600 text-sm">{deleteError.message}</span>}
          </div>
        </div>
      </Modal>
    </>
  );
}