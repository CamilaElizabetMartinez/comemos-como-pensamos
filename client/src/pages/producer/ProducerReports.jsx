import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ButtonSpinner } from '../../components/common/Spinner';
import './ProducerReports.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProducerReports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleDateChange = useCallback((event) => {
    const { name, value } = event.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  }, []);

  const downloadReport = useCallback(async (reportType, format) => {
    const loadingKey = `${reportType}_${format}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/reports/${reportType}/${format}`;
      
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error downloading report');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${reportType}_report_${dateStr}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(t('reports.downloadSuccess'));
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(t('reports.downloadError'));
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [dateRange, t]);

  return (
    <div className="producer-reports">
      <div className="reports-container">
        <div className="reports-header">
          <Link to="/producer" className="back-link">
            {t('producer.dashboard.backToDashboard')}
          </Link>
          <h1>{t('reports.title')}</h1>
          <p className="reports-subtitle">{t('producer.reports.subtitle')}</p>
        </div>

        <div className="date-filter-section">
          <h2>{t('reports.dateFilter')}</h2>
          <p className="filter-hint">{t('reports.dateFilterHint')}</p>
          <div className="date-inputs">
            <div className="date-input-group">
              <label htmlFor="startDate">{t('reports.startDate')}</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="endDate">{t('reports.endDate')}</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
            {(dateRange.startDate || dateRange.endDate) && (
              <button 
                className="btn-clear-dates"
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
              >
                {t('reports.clearDates')}
              </button>
            )}
          </div>
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <h3>{t('producer.reports.mySales')}</h3>
            </div>
            <p className="report-description">{t('producer.reports.mySalesDesc')}</p>
            
            {(dateRange.startDate || dateRange.endDate) && (
              <div className="report-date-range">
                {dateRange.startDate && <span>{dateRange.startDate}</span>}
                {dateRange.startDate && dateRange.endDate && <span> → </span>}
                {dateRange.endDate && <span>{dateRange.endDate}</span>}
              </div>
            )}

            <div className="report-actions">
              <button
                className="btn-download pdf"
                onClick={() => downloadReport('sales', 'pdf')}
                disabled={loading['sales_pdf']}
              >
                {loading['sales_pdf'] ? (
                  <><ButtonSpinner /> PDF</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    PDF
                  </>
                )}
              </button>
              <button
                className="btn-download excel"
                onClick={() => downloadReport('sales', 'excel')}
                disabled={loading['sales_excel']}
              >
                {loading['sales_excel'] ? (
                  <><ButtonSpinner /> Excel</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="3" y1="15" x2="21" y2="15" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                    Excel
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </span>
              <h3>{t('producer.reports.myProducts')}</h3>
            </div>
            <p className="report-description">{t('producer.reports.myProductsDesc')}</p>

            <div className="report-actions">
              <button
                className="btn-download excel full-width"
                onClick={() => downloadReport('products', 'excel')}
                disabled={loading['products_excel']}
              >
                {loading['products_excel'] ? (
                  <><ButtonSpinner /> {t('producer.reports.downloadExcel')}</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="3" y1="15" x2="21" y2="15" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                    {t('producer.reports.downloadExcel')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="reports-info">
          <h3>{t('reports.infoTitle')}</h3>
          <ul>
            <li>{t('producer.reports.infoSales')}</li>
            <li>{t('producer.reports.infoProducts')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProducerReports;

