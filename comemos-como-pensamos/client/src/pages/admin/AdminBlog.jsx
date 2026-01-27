import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ImageUploader from '../../components/common/ImageUploader';
import './AdminBlog.css';

const CATEGORIES = [
  { key: 'recipes', value: 'recipes' },
  { key: 'tips', value: 'tips' },
  { key: 'producers', value: 'producers' },
  { key: 'sustainability', value: 'sustainability' },
  { key: 'news', value: 'news' },
  { key: 'other', value: 'other' }
];

const INITIAL_FORM_STATE = {
  title: { es: '', en: '', fr: '', de: '' },
  slug: '',
  excerpt: { es: '', en: '', fr: '', de: '' },
  content: { es: '', en: '', fr: '', de: '' },
  featuredImages: [],
  category: 'other',
  status: 'draft',
  tags: ''
};

const AdminBlog = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('es');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchArticles();
  }, [user, navigate, statusFilter]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/articles/admin/list?${params.toString()}`);
      setArticles(response.data.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error(t('admin.blog.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, t]);

  const handleOpenModal = useCallback((article = null) => {
    if (article) {
      setSelectedArticle(article);
      setFormData({
        title: article.title || { es: '', en: '', fr: '', de: '' },
        slug: article.slug || '',
        excerpt: article.excerpt || { es: '', en: '', fr: '', de: '' },
        content: article.content || { es: '', en: '', fr: '', de: '' },
        featuredImages: article.featuredImage ? [{ url: article.featuredImage }] : [],
        category: article.category || 'other',
        status: article.status || 'draft',
        tags: article.tags ? article.tags.join(', ') : ''
      });
      setSlugManuallyEdited(true);
    } else {
      setSelectedArticle(null);
      setFormData(INITIAL_FORM_STATE);
      setSlugManuallyEdited(false);
    }
    setActiveLang('es');
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const generateSlug = useCallback((text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    
    if (name === 'slug') {
      setSlugManuallyEdited(true);
      setFormData(prev => ({ ...prev, slug: value }));
      return;
    }
    
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData(prev => {
        const newData = {
          ...prev,
          [field]: { ...prev[field], [lang]: value }
        };
        
        // Auto-generate slug from Spanish title if not manually edited
        if (field === 'title' && lang === 'es' && !slugManuallyEdited) {
          newData.slug = generateSlug(value);
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [slugManuallyEdited, generateSlug]);

  const handleImagesChange = useCallback((images) => {
    setFormData(prev => ({ ...prev, featuredImages: images }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!formData.title.es || !formData.content.es || !formData.excerpt.es) {
      toast.error(t('admin.blog.requiredFields'));
      return;
    }

    setSaving(true);
    try {
      const featuredImageUrl = formData.featuredImages.length > 0 
        ? formData.featuredImages[0].url 
        : '';

      const dataToSend = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: featuredImageUrl,
        category: formData.category,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      if (selectedArticle) {
        await api.put(`/articles/${selectedArticle._id}`, dataToSend);
        toast.success(t('admin.blog.articleUpdated'));
      } else {
        await api.post('/articles', dataToSend);
        toast.success(t('admin.blog.articleCreated'));
      }

      handleCloseModal();
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      const errorMessage = error.response?.data?.message || t('admin.blog.errorSaving');
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [formData, selectedArticle, handleCloseModal, fetchArticles, t]);

  const handleToggleStatus = useCallback(async (article) => {
    try {
      await api.put(`/articles/${article._id}/toggle-status`);
      toast.success(
        article.status === 'published' 
          ? t('admin.blog.articleUnpublished') 
          : t('admin.blog.articlePublished')
      );
      fetchArticles();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.blog.errorUpdating'));
    }
  }, [fetchArticles, t]);

  const handleDelete = useCallback(async (articleId) => {
    if (!window.confirm(t('admin.blog.confirmDelete'))) return;

    try {
      await api.delete(`/articles/${articleId}`);
      toast.success(t('admin.blog.articleDeleted'));
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error(t('admin.blog.errorDeleting'));
    }
  }, [fetchArticles, t]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  if (loading && articles.length === 0) {
    return (
      <div className="admin-blog">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blog">
      <div className="container">
        <header className="page-header">
          <div className="header-left">
            <Link to="/admin" className="back-link">
              {t('admin.backToDashboard')}
            </Link>
            <h1>{t('admin.blog.title')}</h1>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + {t('admin.blog.newArticle')}
          </button>
        </header>

        <div className="filters-bar">
          <button
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            {t('admin.blog.all')}
          </button>
          <button
            className={`filter-btn ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => setStatusFilter('published')}
          >
            {t('admin.blog.published')}
          </button>
          <button
            className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            {t('admin.blog.drafts')}
          </button>
        </div>

        {articles.length === 0 ? (
          <div className="no-articles">
            <p>{t('admin.blog.noArticles')}</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              {t('admin.blog.createFirst')}
            </button>
          </div>
        ) : (
          <div className="articles-table">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.blog.titleColumn')}</th>
                  <th>{t('admin.blog.category')}</th>
                  <th>{t('admin.blog.status')}</th>
                  <th>{t('admin.blog.date')}</th>
                  <th>{t('admin.blog.views')}</th>
                  <th>{t('admin.blog.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article._id}>
                    <td className="title-cell">
                      <strong>{article.title?.es || '-'}</strong>
                      <span className="slug">/{article.slug}</span>
                    </td>
                    <td>
                      <span className="category-badge">
                        {t(`blog.categories.${article.category}`)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${article.status}`}>
                        {t(`admin.blog.${article.status}`)}
                      </span>
                    </td>
                    <td>{formatDate(article.publishedAt || article.createdAt)}</td>
                    <td>{article.views || 0}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-action edit"
                        onClick={() => handleOpenModal(article)}
                        title={t('common.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-action ${article.status === 'published' ? 'unpublish' : 'publish'}`}
                        onClick={() => handleToggleStatus(article)}
                        title={article.status === 'published' ? t('admin.blog.unpublish') : t('admin.blog.publish')}
                      >
                        {article.status === 'published' ? '📤' : '📥'}
                      </button>
                      <a
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-action view"
                        title={t('common.view')}
                      >
                        👁️
                      </a>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(article._id)}
                        title={t('common.delete')}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="article-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {selectedArticle ? t('admin.blog.editArticle') : t('admin.blog.newArticle')}
                </h2>
                <button className="btn-close" onClick={handleCloseModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="article-form">
                <div className="lang-tabs">
                  {['es', 'en', 'fr', 'de'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`lang-tab ${activeLang === lang ? 'active' : ''}`}
                      onClick={() => setActiveLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label>{t('admin.blog.titleLabel')} ({activeLang.toUpperCase()}) *</label>
                  <input
                    type="text"
                    name={`title.${activeLang}`}
                    value={formData.title[activeLang]}
                    onChange={handleChange}
                    required={activeLang === 'es'}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.blog.slugLabel')}</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder={t('admin.blog.slugPlaceholder')}
                    />
                    <p className="field-hint">{t('admin.blog.slugHint')}</p>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.blog.category')}</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {t(`blog.categories.${cat.key}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('admin.blog.excerptLabel')} ({activeLang.toUpperCase()}) *</label>
                  <textarea
                    name={`excerpt.${activeLang}`}
                    value={formData.excerpt[activeLang]}
                    onChange={handleChange}
                    rows={2}
                    required={activeLang === 'es'}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.blog.contentLabel')} ({activeLang.toUpperCase()}) *</label>
                  <textarea
                    name={`content.${activeLang}`}
                    value={formData.content[activeLang]}
                    onChange={handleChange}
                    rows={12}
                    required={activeLang === 'es'}
                    placeholder={t('admin.blog.contentPlaceholder')}
                  />
                  <p className="field-hint">{t('admin.blog.markdownHint')}</p>
                </div>

                <div className="form-group">
                  <label>{t('admin.blog.featuredImage')}</label>
                  <ImageUploader
                    images={formData.featuredImages}
                    onImagesChange={handleImagesChange}
                    maxImages={1}
                    folder="blog"
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.blog.tagsLabel')}</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder={t('admin.blog.tagsPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.blog.status')}</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="draft">{t('admin.blog.draft')}</option>
                    <option value="published">{t('admin.blog.published')}</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
