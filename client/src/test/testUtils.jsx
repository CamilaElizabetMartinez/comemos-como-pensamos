import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

i18n.init({
  lng: 'es',
  fallbackLng: 'es',
  resources: {
    es: {
      translation: {
        'products.new': 'Nuevo',
        'products.lowStock': 'Últimas unidades',
        'products.outOfStock': 'Agotado',
        'products.addToCart': 'Añadir al carrito',
        'products.selectOptions': 'Seleccionar opciones',
        'products.fromPrice': 'Desde',
        'products.vatIncluded': 'IVA incluido',
        'units.kg': 'kg',
        'units.unit': 'unidad',
      },
    },
  },
  interpolation: { escapeValue: false },
});

const mockCartContext = {
  cartItems: [],
  addToCart: vi.fn(() => ({ success: true })),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  getCartTotal: vi.fn(() => 0),
  getCartCount: vi.fn(() => 0),
  getItemsGroupedByProducer: [],
  stockIssues: [],
  validateCartStock: vi.fn(() => Promise.resolve({ valid: true, issues: [] })),
};

function AllProviders({ children }) {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </BrowserRouter>
  );
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, mockCartContext };
