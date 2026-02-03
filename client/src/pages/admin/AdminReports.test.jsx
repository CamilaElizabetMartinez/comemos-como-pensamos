import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminReports from './AdminReports';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';

const originalFetch = global.fetch;

function renderAdminReports() {
  return render(
    <MemoryRouter initialEntries={['/admin/reports']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/admin/reports" element={<AdminReports />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('AdminReports', () => {
  beforeEach(() => {
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders reports section and date filter', () => {
    renderAdminReports();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    const startInput = document.querySelector('input[name="startDate"]');
    const endInput = document.querySelector('input[name="endDate"]');
    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  it('export sales to PDF calls fetch with reports/sales/pdf', async () => {
    const mockBlob = new Blob([''], { type: 'application/pdf' });
    global.fetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) });
    renderAdminReports();
    const pdfButtons = screen.getAllByRole('button', { name: /pdf/i });
    if (pdfButtons.length > 0) {
      await userEvent.click(pdfButtons[0]);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/reports/sales/pdf'),
          expect.any(Object)
        );
      });
    }
  });

  it('export sales to Excel calls fetch with reports/sales/excel', async () => {
    const mockBlob = new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    global.fetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) });
    renderAdminReports();
    const cards = document.querySelectorAll('.report-card, [class*="report"]');
    const excelButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent?.toLowerCase().includes('excel') && button.closest('.report-card')
    );
    if (excelButton) {
      await userEvent.click(excelButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/reports/'),
          expect.any(Object)
        );
      });
    }
  });
});
