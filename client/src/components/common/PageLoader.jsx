import React from 'react';
import './PageLoader.css';

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner" />
    <span className="page-loader-text">Cargando...</span>
  </div>
);

export default PageLoader;
