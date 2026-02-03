import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconHome, IconChevronRight } from './Icons';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items = [], currentPage }) => {
  const { t } = useTranslation();

  const breadcrumbItems = useMemo(() => {
    const allItems = [
      { label: t('common.home', 'Inicio'), path: '/', icon: <IconHome size={14} /> },
      ...items,
    ];
    
    if (currentPage) {
      allItems.push({ label: currentPage, path: null });
    }
    
    return allItems;
  }, [items, currentPage, t]);

  return (
    <nav className="breadcrumbs" aria-label="Navegación de migas de pan">
      <ol className="breadcrumbs-list" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li 
              key={item.path || index} 
              className={`breadcrumb-item ${isLast ? 'current' : ''}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {!isLast && item.path ? (
                <>
                  <Link to={item.path} itemProp="item">
                    {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                    <span itemProp="name">{item.label}</span>
                  </Link>
                  <IconChevronRight size={14} className="breadcrumb-separator" aria-hidden="true" />
                </>
              ) : (
                <span itemProp="name" aria-current="page">{item.label}</span>
              )}
              <meta itemProp="position" content={index + 1} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
  })),
  currentPage: PropTypes.string,
};

export default Breadcrumbs;
