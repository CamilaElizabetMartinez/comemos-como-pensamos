import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

const HappyChild = () => <div>Content OK</div>;

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <HappyChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Content OK')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByRole('heading', { name: /algo salió mal/i })).toBeInTheDocument();
    expect(screen.getByText(/ha ocurrido un error inesperado/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recargar página/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir al inicio/i })).toBeInTheDocument();
    console.error.mockRestore();
  });

  it('reload button calls window.location.reload when clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: reloadMock };
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    screen.getByRole('button', { name: /recargar página/i }).click();
    expect(reloadMock).toHaveBeenCalled();
    window.location = originalLocation;
    console.error.mockRestore();
  });
});
