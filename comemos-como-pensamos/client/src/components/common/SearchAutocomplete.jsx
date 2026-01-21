import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './SearchAutocomplete.css';

const SearchAutocomplete = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState({ products: [], producers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions({ products: [], producers: [] });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/search/suggestions?query=${encodeURIComponent(query)}`);
      setSuggestions(response.data.data.suggestions || { products: [], producers: [] });
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProductName = (product) => {
    const currentLang = i18n.language;
    return product.name?.[currentLang] || product.name?.es || product.name;
  };

  const totalSuggestions = (suggestions.products?.length || 0) + (suggestions.producers?.length || 0);

  const handleKeyDown = (event) => {
    if (!showSuggestions || totalSuggestions === 0) {
      if (event.key === 'Enter') {
        onSubmit?.(event);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalSuggestions - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(selectedIndex);
        } else {
          setShowSuggestions(false);
          onSubmit?.(event);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelectSuggestion = (index) => {
    const productsLength = suggestions.products?.length || 0;
    
    if (index < productsLength) {
      const product = suggestions.products[index];
      navigate(`/products/${product._id}`);
    } else {
      const producer = suggestions.producers[index - productsLength];
      navigate(`/producers/${producer._id}`);
    }
    
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
    setShowSuggestions(false);
  };

  const handleProducerClick = (producer) => {
    navigate(`/producers/${producer._id}`);
    setShowSuggestions(false);
  };

  const hasSuggestions = (suggestions.products?.length > 0 || suggestions.producers?.length > 0);

  return (
    <div className={`search-autocomplete ${className}`} ref={wrapperRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-autocomplete-input"
          autoComplete="off"
        />
        {loading && <span className="search-loading">⏳</span>}
        <button 
          type="submit" 
          className="search-autocomplete-btn"
          onClick={(e) => {
            setShowSuggestions(false);
            onSubmit?.(e);
          }}
        >
          🔍
        </button>
      </div>

      {showSuggestions && hasSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.products?.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <span>🛒 {t('search.products')}</span>
              </div>
              {suggestions.products.map((product, index) => (
                <div
                  key={product._id}
                  className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="suggestion-image">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={getProductName(product)} />
                    ) : (
                      <span className="no-image">📦</span>
                    )}
                  </div>
                  <div className="suggestion-info">
                    <span className="suggestion-name">{getProductName(product)}</span>
                    <span className="suggestion-category">{t(`products.categories.${product.category}`)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {suggestions.producers?.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <span>🌱 {t('search.producers')}</span>
              </div>
              {suggestions.producers.map((producer, index) => {
                const adjustedIndex = (suggestions.products?.length || 0) + index;
                return (
                  <div
                    key={producer._id}
                    className={`suggestion-item ${selectedIndex === adjustedIndex ? 'selected' : ''}`}
                    onClick={() => handleProducerClick(producer)}
                    onMouseEnter={() => setSelectedIndex(adjustedIndex)}
                  >
                    <div className="suggestion-image producer-logo">
                      {producer.logo ? (
                        <img src={producer.logo} alt={producer.businessName} />
                      ) : (
                        <span className="no-image">🏪</span>
                      )}
                    </div>
                    <div className="suggestion-info">
                      <span className="suggestion-name">{producer.businessName}</span>
                      <span className="suggestion-category">{t('search.producer')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="suggestions-footer">
            <button 
              className="view-all-btn"
              onClick={(e) => {
                setShowSuggestions(false);
                onSubmit?.(e);
              }}
            >
              {t('search.viewAllResults')} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;



