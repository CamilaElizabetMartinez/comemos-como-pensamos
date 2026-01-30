import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { IconCart, IconPackage, IconLeaf } from './Icons';
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

  const handleClear = useCallback(() => {
    onChange('');
    setSuggestions({ products: [], producers: [] });
    setShowSuggestions(false);
  }, [onChange]);

  return (
    <div className={`search-autocomplete ${className}`} ref={wrapperRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
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
        {loading && (
          <span className="search-loader">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
            </svg>
          </span>
        )}
        {value && !loading && (
          <button 
            type="button" 
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button 
          type="submit" 
          className="search-autocomplete-btn"
          onClick={(e) => {
            setShowSuggestions(false);
            onSubmit?.(e);
          }}
          aria-label="Buscar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {showSuggestions && hasSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.products?.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <span><IconCart size={16} /> {t('search.products')}</span>
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
                      <img src={product.images[0]} alt={getProductName(product)} loading="lazy" />
                    ) : (
                      <span className="no-image"><IconPackage size={20} /></span>
                    )}
                  </div>
                  <div className="suggestion-info">
                    <span className="suggestion-name">{getProductName(product)}</span>
                    <span className="suggestion-category">{t(`products.categories.${product.category}`)}</span>
                  </div>
                  <span className="suggestion-price">
                    {product.price?.toFixed(2).replace('.', ',')}€
                  </span>
                </div>
              ))}
            </div>
          )}

          {suggestions.producers?.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <span><IconLeaf size={16} /> {t('search.producers')}</span>
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
                        <img src={producer.logo} alt={producer.businessName} loading="lazy" />
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




