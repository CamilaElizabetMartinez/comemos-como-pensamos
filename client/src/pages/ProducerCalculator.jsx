import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconLeaf, IconPackage } from '../components/common/Icons';
import './ProducerCalculator.css';

const PRODUCT_CATEGORIES = [
  { id: 'fruits', avgPrice: 3.50 },
  { id: 'vegetables', avgPrice: 2.80 },
  { id: 'dairy', avgPrice: 4.50 },
  { id: 'meat', avgPrice: 12.00 },
  { id: 'bakery', avgPrice: 3.00 },
  { id: 'eggs', avgPrice: 3.50 },
  { id: 'honey', avgPrice: 8.00 },
  { id: 'oil', avgPrice: 10.00 },
  { id: 'wine', avgPrice: 9.00 }
];

const TRADITIONAL_COSTS = {
  marketStallMonthly: 200,
  transportWeekly: 30,
  hoursPerMarketDay: 8,
  marketDaysPerWeek: 2,
  hourlyValueEstimate: 12
};

const PLATFORM_COMMISSION = 15;

const ProducerCalculator = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    category: 'vegetables',
    avgPrice: 2.80,
    weeklyUnits: 100,
    marketDays: 2
  });

  const [showComparison, setShowComparison] = useState(false);

  const handleCategoryChange = useCallback((categoryId) => {
    const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      avgPrice: category?.avgPrice || prev.avgPrice
    }));
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  }, []);

  const calculations = useMemo(() => {
    const weeklyRevenue = formData.avgPrice * formData.weeklyUnits;
    const monthlyRevenue = weeklyRevenue * 4;
    const yearlyRevenue = monthlyRevenue * 12;

    const weeklyCommission = weeklyRevenue * (PLATFORM_COMMISSION / 100);
    const monthlyCommission = weeklyCommission * 4;

    const weeklyNet = weeklyRevenue - weeklyCommission;
    const monthlyNet = monthlyRevenue - monthlyCommission;
    const yearlyNet = yearlyRevenue - (monthlyCommission * 12);

    const traditionalMonthlyStall = TRADITIONAL_COSTS.marketStallMonthly;
    const traditionalMonthlyTransport = TRADITIONAL_COSTS.transportWeekly * 4;
    const traditionalMonthlyHours = TRADITIONAL_COSTS.hoursPerMarketDay * 
      formData.marketDays * 4;
    const traditionalMonthlyTimeCost = traditionalMonthlyHours * 
      TRADITIONAL_COSTS.hourlyValueEstimate;
    const traditionalTotalMonthlyCosts = traditionalMonthlyStall + 
      traditionalMonthlyTransport + traditionalMonthlyTimeCost;

    const traditionalMonthlyNet = monthlyRevenue - traditionalTotalMonthlyCosts;

    const platformAdvantage = monthlyNet - traditionalMonthlyNet;
    const hoursSavedMonthly = traditionalMonthlyHours;

    return {
      weekly: {
        revenue: weeklyRevenue,
        commission: weeklyCommission,
        net: weeklyNet
      },
      monthly: {
        revenue: monthlyRevenue,
        commission: monthlyCommission,
        net: monthlyNet
      },
      yearly: {
        revenue: yearlyRevenue,
        net: yearlyNet
      },
      traditional: {
        stallCost: traditionalMonthlyStall,
        transportCost: traditionalMonthlyTransport,
        timeCost: traditionalMonthlyTimeCost,
        totalCosts: traditionalTotalMonthlyCosts,
        netProfit: traditionalMonthlyNet,
        hours: traditionalMonthlyHours
      },
      comparison: {
        advantage: platformAdvantage,
        hoursSaved: hoursSavedMonthly,
        percentageBetter: traditionalMonthlyNet > 0 
          ? ((platformAdvantage / traditionalMonthlyNet) * 100).toFixed(0)
          : 100
      }
    };
  }, [formData]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const selectedCategory = useMemo(() => {
    return PRODUCT_CATEGORIES.find(cat => cat.id === formData.category);
  }, [formData.category]);

  return (
    <div className="producer-calculator">
      <div className="calculator-hero">
        <div className="container">
          <Link to="/" className="back-home">
            {t('calculator.backToHome')}
          </Link>
          <h1>{t('calculator.title')}</h1>
          <p className="hero-subtitle">{t('calculator.subtitle')}</p>
        </div>
      </div>

      <div className="container">
        <div className="calculator-content">
          <div className="calculator-form">
            <div className="form-section">
              <h2>{t('calculator.productInfo')}</h2>
              
              <div className="category-selector">
                <label>{t('calculator.selectCategory')}</label>
                <div className="category-grid">
                  {PRODUCT_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      className={`category-btn ${formData.category === category.id ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      <span className="category-icon"><IconLeaf size={20} /></span>
                      <span className="category-name">{t(`categories.${category.id}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="avgPrice">{t('calculator.avgPrice')}</label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      id="avgPrice"
                      name="avgPrice"
                      value={formData.avgPrice}
                      onChange={handleInputChange}
                      min="0.5"
                      step="0.1"
                    />
                    <span className="input-icon">€</span>
                  </div>
                  <span className="form-hint">{t('calculator.avgPriceHint')}</span>
                </div>

                <div className="form-group">
                  <label htmlFor="weeklyUnits">{t('calculator.weeklyUnits')}</label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      id="weeklyUnits"
                      name="weeklyUnits"
                      value={formData.weeklyUnits}
                      onChange={handleInputChange}
                      min="1"
                      step="10"
                    />
                    <span className="input-icon"><IconPackage size={16} /></span>
                  </div>
                  <span className="form-hint">{t('calculator.weeklyUnitsHint')}</span>
                </div>
              </div>
            </div>

            <div className="commission-info">
              <div className="commission-badge">
                <span className="commission-value">{PLATFORM_COMMISSION}%</span>
                <span className="commission-label">{t('calculator.platformCommission')}</span>
              </div>
              <p>{t('calculator.commissionExplain')}</p>
            </div>
          </div>

          <div className="calculator-results">
            <div className="results-card main-result">
              <div className="result-header">
                <h3>{t('calculator.yourEarnings')}</h3>
                <span className="result-period">{t('calculator.monthly')}</span>
              </div>
              <div className="result-amount">
                {formatCurrency(calculations.monthly.net)}
              </div>
              <div className="result-breakdown">
                <div className="breakdown-item">
                  <span>{t('calculator.grossRevenue')}</span>
                  <span>{formatCurrency(calculations.monthly.revenue)}</span>
                </div>
                <div className="breakdown-item commission">
                  <span>{t('calculator.commission')} ({PLATFORM_COMMISSION}%)</span>
                  <span>-{formatCurrency(calculations.monthly.commission)}</span>
                </div>
              </div>
            </div>

            <div className="results-grid">
              <div className="results-card small">
                <span className="card-label">{t('calculator.weekly')}</span>
                <span className="card-value">{formatCurrency(calculations.weekly.net)}</span>
              </div>
              <div className="results-card small">
                <span className="card-label">{t('calculator.yearly')}</span>
                <span className="card-value">{formatCurrency(calculations.yearly.net)}</span>
              </div>
            </div>

            <button 
              className="btn-compare"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? t('calculator.hideComparison') : t('calculator.showComparison')}
            </button>

            {showComparison && (
              <div className="comparison-section">
                <h3>{t('calculator.vsTraditional')}</h3>
                
                <div className="comparison-cards">
                  <div className="comparison-card platform">
                    <div className="comparison-header">
                      <span className="comparison-icon">🌐</span>
                      <span className="comparison-title">{t('calculator.withPlatform')}</span>
                    </div>
                    <div className="comparison-amount positive">
                      {formatCurrency(calculations.monthly.net)}
                    </div>
                    <ul className="comparison-benefits">
                      <li>✓ {t('calculator.noStallCost')}</li>
                      <li>✓ {t('calculator.noTransport')}</li>
                      <li>✓ {t('calculator.sellFromHome')}</li>
                      <li>✓ {t('calculator.reachMoreCustomers')}</li>
                    </ul>
                  </div>

                  <div className="comparison-card traditional">
                    <div className="comparison-header">
                      <span className="comparison-icon">🏪</span>
                      <span className="comparison-title">{t('calculator.traditionalMarket')}</span>
                    </div>
                    <div className={`comparison-amount ${calculations.traditional.netProfit >= 0 ? 'neutral' : 'negative'}`}>
                      {formatCurrency(calculations.traditional.netProfit)}
                    </div>
                    <ul className="comparison-costs">
                      <li>
                        <span>{t('calculator.stallRent')}</span>
                        <span>-{formatCurrency(calculations.traditional.stallCost)}</span>
                      </li>
                      <li>
                        <span>{t('calculator.transport')}</span>
                        <span>-{formatCurrency(calculations.traditional.transportCost)}</span>
                      </li>
                      <li>
                        <span>{t('calculator.timeValue')} ({calculations.traditional.hours}h)</span>
                        <span>-{formatCurrency(calculations.traditional.timeCost)}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {calculations.comparison.advantage > 0 && (
                  <div className="advantage-banner">
                    <div className="advantage-amount">
                      +{formatCurrency(calculations.comparison.advantage)}
                      <span>{t('calculator.morePerMonth')}</span>
                    </div>
                    <div className="advantage-time">
                      <span className="time-icon">⏰</span>
                      <span>{t('calculator.saveHours', { hours: calculations.comparison.hoursSaved })}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cta-section">
          <h2>{t('calculator.readyToStart')}</h2>
          <p>{t('calculator.ctaDescription')}</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              {t('calculator.registerNow')}
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              {t('calculator.contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerCalculator;
