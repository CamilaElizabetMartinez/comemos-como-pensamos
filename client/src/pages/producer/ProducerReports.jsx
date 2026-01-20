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
            ← {t('producer.dashboard.backToDashboard')}
          </Link>
          <h1>📊 {t('reports.title')}</h1>
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
              <span className="report-icon">💰</span>
              <h3>{t('producer.reports.mySales')}</h3>
            </div>
            <p className="report-description">{t('producer.reports.mySalesDesc')}</p>
            
            {(dateRange.startDate || dateRange.endDate) && (
              <div className="report-date-range">
                <span>📅 </span>
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
                  <>📄 PDF</>
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
                  <>📊 Excel</>
                )}
              </button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-header">
              <span className="report-icon">📦</span>
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
                  <>📊 {t('producer.reports.downloadExcel')}</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="reports-info">
          <h3>ℹ️ {t('reports.infoTitle')}</h3>
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

