import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ListSkeleton } from '../components/common/Skeleton';
import './ProducersPage.css';

const ProducersPage = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useTranslation();

  const fetchProducers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 12 });
      if (search) params.append('search', search);
      if (cityFilter) params.append('city', cityFilter);

      const response = await api.get(`/producers?${params}`);
      setProducers(response.data.data.producers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error(t('producers.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, cityFilter, t]);

  useEffect(() => {
    fetchProducers();
  }, [fetchProducers]);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchProducers();
  };

  return (
    <div className="producers-page">
      <div className="producers-container">
        <div className="producers-header">
          <h1>{t('producers.title')}</h1>
          <p className="producers-subtitle">{t('producers.subtitle')}</p>
        </div>

        <form onSubmit={handleSearch} className="producers-filters">
          <div className="search-group">
            <input
              type="text"
              placeholder={t('producers.searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder={t('producers.cityPlaceholder')}
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="city-input"
            />
            <button type="submit" className="btn btn-primary search-btn" aria-label={t('common.search')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>
        </form>

        {loading ? (
          <ListSkeleton type="producer" count={6} />
        ) : producers.length === 0 ? (
          <div className="no-producers">
            <div className="no-producers-icon">🌱</div>
            <h2>{t('producers.noProducers')}</h2>
            <p>{t('producers.noProducersDescription')}</p>
          </div>
        ) : (
          <>
            <div className="producers-grid">
              {producers.map((producer) => (
                <article key={producer._id} className="producer-card">
                  <div className="producer-image">
                    <Link to={`/producers/${producer._id}`} title={producer.businessName}>
                      {producer.logo ? (
                        <img src={producer.logo} alt={producer.businessName} />
                      ) : (
                        <div className="image-placeholder">
                          {producer.businessName?.charAt(0)}
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="producer-content">
                    <div className="producer-text">
                      <h2>
                        <Link to={`/producers/${producer._id}`} title={producer.businessName}>
                          {producer.businessName}
                        </Link>
                      </h2>
                      {producer.location && (
                        <p className="producer-location">
                          {producer.location.city}
                        </p>
                      )}
                    </div>
                    <div className="producer-actions">
                      <Link 
                        to={`/products?producer=${producer._id}`} 
                        className="btn-view-products"
                        title={t('producers.viewProducts')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {t('producers.viewProducts')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-pagination"
                >
                  {t('common.previous')}
                </button>
                <span className="page-info">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-pagination"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProducersPage;








