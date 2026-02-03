import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerProfile from './ProducerProfile';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', role: 'producer' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

vi.mock('../../components/common/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">Logo</div>,
}));

const mockProducer = {
  _id: 'prod-1',
  businessName: 'Finca Sol',
  description: { es: 'Aceite ecológico', en: '' },
  logo: '',
  location: { address: '', city: 'Málaga', region: 'Andalucía' },
  certifications: ['organic'],
  whatsapp: '',
};

function renderProducerProfile() {
  return render(
    <MemoryRouter initialEntries={['/producer/profile']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/profile" element={<ProducerProfile />} />
            <Route path="/producer" element={<div data-testid="producer-dashboard" />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    api.get.mockResolvedValue({
      data: { success: true, data: { producer: mockProducer } },
    });
  });

  it('fetches and displays producer profile', async () => {
    renderProducerProfile();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/producers/me');
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Finca Sol')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Málaga')).toBeInTheDocument();
    });
  });

  it('renders logo uploader', async () => {
    renderProducerProfile();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Finca Sol')).toBeInTheDocument();
    });
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });

  it('calls API on save', async () => {
    api.put.mockResolvedValue({ data: { success: true } });
    renderProducerProfile();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Finca Sol')).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: /guardar|save/i });
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(expect.stringContaining('/producers/'), expect.any(Object));
    });
  });

  it('renders certifications section and save includes certifications in payload', async () => {
    api.put.mockResolvedValue({ data: { success: true } });
    renderProducerProfile();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Finca Sol')).toBeInTheDocument();
    });
    const certificationsHeading = screen.getByRole('heading', { name: /certificaciones|certifications/i });
    expect(certificationsHeading).toBeInTheDocument();
    const certificationChips = document.querySelectorAll('.certification-chip');
    expect(certificationChips.length).toBeGreaterThanOrEqual(1);
    const saveButton = screen.getByRole('button', { name: /guardar cambios|save changes/i });
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
      const payload = api.put.mock.calls[0][1];
      expect(payload).toHaveProperty('certifications');
      expect(Array.isArray(payload.certifications)).toBe(true);
    });
  });
});
