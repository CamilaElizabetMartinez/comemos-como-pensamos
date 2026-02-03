import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ContactPage from './ContactPage';
import i18n from '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { post: vi.fn() } }));

function renderContactPage() {
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <ContactPage />
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact form with name, email, subject and message fields', () => {
    renderContactPage();
    expect(document.querySelector('input#name') || document.querySelector('input[name="name"]')).toBeTruthy();
    expect(document.querySelector('input#email') || document.querySelector('input[name="email"]')).toBeTruthy();
    expect(document.querySelector('select#subject') || document.querySelector('select[name="subject"]')).toBeTruthy();
    expect(document.querySelector('textarea#message') || document.querySelector('textarea[name="message"]')).toBeTruthy();
  });

  it('renders submit button', () => {
    renderContactPage();
    const submitButton = screen.getByRole('button', { name: /enviar|send|submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('calls API on submit with valid form values', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderContactPage();
    const nameInput = document.querySelector('input#name');
    const emailInput = document.querySelector('input#email');
    const messageInput = document.querySelector('textarea#message');
    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.selectOptions(document.querySelector('select#subject'), 'general');
    await userEvent.type(messageInput, 'This is a test message with enough characters for validation.');
    const submitButton = screen.getByRole('button', { name: /enviar|send/i });
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/contact', expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'general',
        message: expect.any(String),
      }));
    });
  });
});
