import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>COMEMOS COMO PENSAMOS</h1>
          <p>Conectando productores locales con consumidores conscientes</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Explorar Productos
            </Link>
            <Link to="/producers" className="btn btn-secondary">
              Conoce a los Productores
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>¿Por qué elegirnos?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>🌱 Productos Locales</h3>
              <p>Apoyamos a productores locales y reducimos la huella de carbono</p>
            </div>
            <div className="feature">
              <h3>✅ Calidad Garantizada</h3>
              <p>Todos nuestros productores son verificados y certificados</p>
            </div>
            <div className="feature">
              <h3>🚚 Envío Rápido</h3>
              <p>Del productor a tu puerta en el menor tiempo posible</p>
            </div>
            <div className="feature">
              <h3>💚 Sostenible</h3>
              <p>Prácticas sostenibles y respetuosas con el medio ambiente</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
