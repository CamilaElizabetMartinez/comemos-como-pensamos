import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProducerReports from './ProducerReports';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';

const originalFetch = global.fetch;

function renderProducerReports() {
  return render(
    <MemoryRouter initialEntries={['/producer/reports']}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/producer/reports" element={<ProducerReports />} />
          </Routes>
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('ProducerReports', () => {
  beforeEach(() => {
    window.localStorage.getItem.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders reports title and back link', () => {
    renderProducerReports();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    const backLink = screen.getByRole('link', { name: /dashboard|panel|volver/i });
    expect(backLink).toHaveAttribute('href', '/producer');
  });

  it('renders export download buttons (PDF and Excel)', () => {
    renderProducerReports();
    const pdfButtons = screen.getAllByRole('button', { name: /pdf/i });
    const excelButtons = screen.getAllByRole('button', { name: /excel/i });
    expect(pdfButtons.length).toBeGreaterThanOrEqual(1);
    expect(excelButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders date range inputs', () => {
    renderProducerReports();
    const startInput = document.querySelector('input[name="startDate"]');
    const endInput = document.querySelector('input[name="endDate"]');
    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  it('export products to Excel calls fetch with reports/products/excel', async () => {
    const mockBlob = new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    global.fetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) });
    renderProducerReports();
    const productsCard = screen.getByRole('heading', { name: /mis productos|my products/i }).closest('.report-card');
    const productsExcelButton = productsCard.querySelector('.btn-download.excel');
    await userEvent.click(productsExcelButton);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reports/products/excel'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: expect.any(String) }),
        })
      );
    });
  });

  it('export sales to Excel calls fetch with reports/sales/excel', async () => {
    const mockBlob = new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    global.fetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) });
    renderProducerReports();
    const salesCard = screen.getByRole('heading', { name: /mis ventas|my sales/i }).closest('.report-card');
    const salesExcelButton = salesCard.querySelector('.btn-download.excel');
    await userEvent.click(salesExcelButton);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reports/sales/excel'),
        expect.any(Object)
      );
    });
  });
});
