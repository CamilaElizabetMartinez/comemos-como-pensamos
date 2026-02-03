import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerShipping from './ProducerShipping';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

vi.mock('../../components/common/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button type="button" onClick={onConfirm}>Confirm</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const mockZones = [
  { _id: 'z1', name: 'Málaga', cost: 5, minimumOrder: 30, postalCodes: ['29001'], cities: ['Málaga'], estimatedDays: '2-3' },
];

function renderProducerShipping() {
  return render(
    <MemoryRouter initialEntries={['/producer/shipping']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/shipping" element={<ProducerShipping />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerShipping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: { data: { shippingZones: mockZones } },
    });
  });

  it('fetches and displays shipping zones', async () => {
    renderProducerShipping();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/shipping/zones/my');
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Málaga/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders button to add zone', async () => {
    renderProducerShipping();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    const addButton = document.querySelector('.btn-add-zone') || screen.getByRole('button', { name: /añadir|zona|add zone/i });
    expect(addButton).toBeInTheDocument();
  });

  it('shows form when adding zone', async () => {
    renderProducerShipping();
    await waitFor(() => {
      expect(screen.getAllByText(/Málaga/).length).toBeGreaterThanOrEqual(1);
    });
    const addButton = document.querySelector('.btn-add-zone') || screen.getByRole('button', { name: /añadir|zona|add zone/i });
    await userEvent.click(addButton);
    await waitFor(() => {
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
    const submitButton = screen.getByRole('button', { name: /guardar|crear|save/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderProducerShipping();
    const skeleton = document.querySelector('.skeleton') || document.querySelector('[class*="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
