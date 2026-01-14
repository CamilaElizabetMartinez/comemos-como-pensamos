import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar items de la orden
      const items = cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }));

      // Crear orden
      const orderData = await orderService.createOrder({
        items,
        shippingAddress,
        shippingCost: 5.00 // Simplificado
      });

      const orderId = orderData.data.order._id;

      // Crear Payment Intent
      const paymentData = await orderService.createPaymentIntent(orderId);

      // En producción, aquí se integraría Stripe Elements
      // Por ahora, simulamos pago exitoso
      toast.success('¡Orden creada exitosamente!');
      clearCart();
      navigate('/');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Dirección de Envío</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingAddress.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingAddress.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                name="street"
                value={shippingAddress.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Código Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>País</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Procesando...' : 'Realizar Pedido'}
            </button>
          </form>

          <div className="order-summary">
            <h2>Resumen del Pedido</h2>
            {cartItems.map((item) => (
              <div key={item._id} className="summary-item">
                <span>{item.name?.es} x {item.quantity}</span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item">
              <span>Subtotal</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Envío</span>
              <span>€5.00</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>€{(getCartTotal() + 5).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
