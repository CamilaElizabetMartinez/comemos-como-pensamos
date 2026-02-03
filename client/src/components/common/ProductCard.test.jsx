import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/testUtils';
import ProductCard from './ProductCard';

// Mock useCart hook
vi.mock('../../context/CartContext', () => ({
  useCart: () => ({
    addToCart: vi.fn(() => ({ success: true })),
  }),
}));

const mockProduct = {
  _id: '123',
  name: { es: 'Tomates ecológicos', en: 'Organic tomatoes' },
  price: 3.50,
  unit: 'kg',
  stock: 10,
  isAvailable: true,
  images: ['https://example.com/tomato.jpg'],
  createdAt: new Date().toISOString(),
};

describe('ProductCard', () => {
  it('renders product name correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Tomates ecológicos')).toBeInTheDocument();
  });

  it('renders product price correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('3,50')).toBeInTheDocument();
  });

  it('shows add to cart button when product is available', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Añadir al carrito')).toBeInTheDocument();
  });

  it('shows out of stock badge when product is not available', () => {
    const unavailableProduct = { ...mockProduct, isAvailable: false };
    render(<ProductCard product={unavailableProduct} />);
    const outOfStockElements = screen.getAllByText('Agotado');
    expect(outOfStockElements.length).toBeGreaterThan(0);
    expect(outOfStockElements[0]).toHaveClass('badge-out-of-stock');
  });

  it('shows low stock badge when stock is 5 or less', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 };
    render(<ProductCard product={lowStockProduct} />);
    expect(screen.getByText('Últimas unidades')).toBeInTheDocument();
  });

  it('shows new badge for recently created products', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('does not show new badge for old products', () => {
    const oldProduct = {
      ...mockProduct,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    };
    render(<ProductCard product={oldProduct} />);
    expect(screen.queryByText('Nuevo')).not.toBeInTheDocument();
  });

  it('renders product image with correct alt text', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText('Tomates ecológicos');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/tomato.jpg');
  });

  it('shows select options button for products with variants', () => {
    const variantProduct = {
      ...mockProduct,
      hasVariants: true,
      variants: [
        { price: 3.50, weight: 500, weightUnit: 'g', isDefault: true },
        { price: 6.00, weight: 1000, weightUnit: 'g' },
      ],
    };
    render(<ProductCard product={variantProduct} />);
    expect(screen.getByText('Seleccionar opciones')).toBeInTheDocument();
  });

  it('shows minimum price for products with variants', () => {
    const variantProduct = {
      ...mockProduct,
      hasVariants: true,
      variants: [
        { price: 5.00, weight: 500, weightUnit: 'g' },
        { price: 3.50, weight: 250, weightUnit: 'g', isDefault: true },
      ],
    };
    render(<ProductCard product={variantProduct} />);
    expect(screen.getByText('Desde')).toBeInTheDocument();
    expect(screen.getByText('3,50')).toBeInTheDocument();
  });
});
