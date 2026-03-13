import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataSafetyPanel from '../DataSafetyPanel';

vi.mock('../../../utils/dataExporter', () => ({
  downloadExport: vi.fn(),
  readImportFile: vi.fn(),
  importPayload: vi.fn(),
}));

vi.mock('../../../utils/backupManager', () => ({
  backupNow: vi.fn(() => Promise.resolve()),
}));

describe('DataSafetyPanel', () => {
  it('renders heading and both buttons', () => {
    render(<DataSafetyPanel />);
    expect(screen.getByTestId('data-safety-panel')).toBeTruthy();
    expect(screen.getByText('Training Data')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export Data' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Import Data' })).toBeTruthy();
  });

  it('calls downloadExport when Export is clicked', async () => {
    const { downloadExport } = await import('../../../utils/dataExporter');
    render(<DataSafetyPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Export Data' }));
    expect(downloadExport).toHaveBeenCalledOnce();
  });

  it('renders hidden file input for import', () => {
    render(<DataSafetyPanel />);
    const input = screen.getByLabelText('Import training data file');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('file');
    expect(input.getAttribute('accept')).toBe('.json');
  });
});
