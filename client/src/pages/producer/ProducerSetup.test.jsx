import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerSetup from './ProducerSetup';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', role: 'producer', email: 'p@test.com' } }),
}));

vi.mock('../../services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

vi.mock('../../components/common/ImageUploader', () => ({
  default: ({ onImagesChange }) => (
    <div data-testid="image-uploader">
      <button type="button" onClick={() => onImagesChange([{ url: 'https://logo.jpg' }])}>
        Add logo
      </button>
    </div>
  ),
}));

function renderProducerSetup() {
  return render(
    <MemoryRouter initialEntries={['/producer/setup']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/setup" element={<ProducerSetup />} />
            <Route path="/producer" element={<div data-testid="producer-dashboard" />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.setItem.mockImplementation((key, value) => {
      if (key === 'token') return;
      if (key === 'referralCode') return;
    });
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'referralCode') return '';
      return null;
    });
    api.get.mockRejectedValue({ response: { status: 404 } });
  });

  it('shows loading then setup form when no producer profile exists', async () => {
    renderProducerSetup();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/producers/me');
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /registro|setup|productor/i })).toBeInTheDocument();
    });
  });

  it('renders business info fields: name, description, logo', async () => {
    renderProducerSetup();
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre del negocio|business name/i)).toBeInTheDocument();
    });
    const businessNameInput = document.querySelector('input#businessName') || document.querySelector('input[name="businessName"]');
    const descriptionTextarea = document.querySelector('textarea[name="description.es"]') || document.querySelector('#description\\.es');
    expect(businessNameInput).toBeInTheDocument();
    expect(descriptionTextarea).toBeInTheDocument();
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });

  it('renders location fields', async () => {
    renderProducerSetup();
    await waitFor(() => {
      expect(document.querySelector('input[name="businessName"]')).toBeInTheDocument();
    });
    const cityInput = document.querySelector('input[name="location.city"]');
    expect(cityInput).toBeInTheDocument();
  });

  it('renders multiple form sections', async () => {
    renderProducerSetup();
    await waitFor(() => {
      expect(document.querySelector('input[name="businessName"]')).toBeInTheDocument();
    });
    const sections = document.querySelectorAll('.form-section, .setup-form section');
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it('calls API on submit with form data', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderProducerSetup();
    await waitFor(() => {
      expect(document.querySelector('input[name="businessName"]')).toBeInTheDocument();
    });
    const businessInput = document.querySelector('input[name="businessName"]');
    const descInput = document.querySelector('textarea[name="description.es"]');
    const cityInput = document.querySelector('input[name="location.city"]');
    await userEvent.type(businessInput, 'Finca Test');
    await userEvent.type(descInput, 'Descripción en español.');
    await userEvent.type(cityInput, 'Málaga');
    const submitButton = screen.getByRole('button', { name: /crear perfil|enviar|solicitud|submit|registrar/i });
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/producers', expect.any(Object));
    }, { timeout: 2000 });
  });
});
