import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { TableSkeleton } from '../../components/common/Skeleton';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate, currentPage, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${currentPage}&limit=15`;
      if (roleFilter) url += `&role=${roleFilter}`;

      const response = await api.get(url);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('admin.users.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(t('admin.users.confirmDelete', { name: userName }))) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success(t('admin.users.deleted'));
    } catch (error) {
      toast.error(t('admin.users.deleteError'));
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'role-admin',
      producer: 'role-producer',
      customer: 'role-customer'
    };
    return classes[role] || '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase());
  });

  if (loading && users.length === 0) {
    return (
      <div className="admin-users">
        <div className="container">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              {t('admin.users.backToDashboard')}
            </Link>
            <h1>{t('admin.users.title')}</h1>
          </div>
        </header>

        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('admin.users.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="role-filters">
            <button
              className={`filter-btn ${roleFilter === '' ? 'active' : ''}`}
              onClick={() => { setRoleFilter(''); setCurrentPage(1); }}
            >
              {t('admin.users.allRoles')}
            </button>
            <button
              className={`filter-btn ${roleFilter === 'customer' ? 'active' : ''}`}
              onClick={() => { setRoleFilter('customer'); setCurrentPage(1); }}
            >
              {t('profile.role.customer')}
            </button>
            <button
              className={`filter-btn ${roleFilter === 'producer' ? 'active' : ''}`}
              onClick={() => { setRoleFilter('producer'); setCurrentPage(1); }}
            >
              {t('profile.role.producer')}
            </button>
            <button
              className={`filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => { setRoleFilter('admin'); setCurrentPage(1); }}
            >
              {t('profile.role.admin')}
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>{t('admin.users.noUsers')}</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('admin.users.user')}</th>
                  <th>{t('admin.users.email')}</th>
                  <th>{t('admin.users.role')}</th>
                  <th>{t('admin.users.registered')}</th>
                  <th>{t('admin.users.status')}</th>
                  <th>{t('admin.users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                        </div>
                        <span className="user-name">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="email-cell">{u.email}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                        {t(`profile.role.${u.role}`)}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`status-indicator ${u.isEmailVerified ? 'verified' : 'unverified'}`}>
                        {u.isEmailVerified ? '✓' : '○'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {u._id !== user._id && u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                            className="btn-delete"
                            title={t('common.delete')}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-pagination"
            >
              {t('common.previous')}
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-pagination"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

