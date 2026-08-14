import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ExportReporting from './ExportReporting';
import * as exportUtils from '../utils/exportUtils';

vi.mock('../context/TaskContext', () => ({
  useTasks: () => ({
    tasks: [
      {
        id: '1',
        text: 'Sample task',
        completed: false,
        createdAt: new Date().toISOString(),
        priority: 'medium',
        category: 'general',
        description: 'Example',
        subtasks: [],
        comments: []
      }
    ],
    spaces: [],
    userProfile: { name: 'Test User' },
    setTasks: vi.fn(),
    addToast: vi.fn()
  })
}));

describe('ExportReporting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not export when the CSV card is clicked', async () => {
    const exportSpy = vi.spyOn(exportUtils, 'exportToCSV').mockImplementation(() => {});

    render(<ExportReporting />);
    fireEvent.click(screen.getByText('Export as CSV').closest('[role="button"]'));

    await waitFor(() => {
      expect(exportSpy).not.toHaveBeenCalled();
    });
  });

  it('opens a preview tab when the PDF preview action is clicked', async () => {
    const previewSpy = vi.spyOn(window, 'open').mockImplementation(() => ({
      document: { write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      close: vi.fn(),
      opener: null
    }));
    const exportSpy = vi.spyOn(exportUtils, 'exportToPDF').mockImplementation(async () => {});
    const previewPdfSpy = vi.spyOn(exportUtils, 'previewPDF').mockResolvedValue({
      focus: vi.fn(),
      close: vi.fn(),
      opener: null
    });

    render(<ExportReporting />);
    fireEvent.click(screen.getAllByRole('button', { name: /preview pdf/i })[0]);

    await waitFor(() => {
      expect(previewPdfSpy).toHaveBeenCalled();
      expect(exportSpy).not.toHaveBeenCalled();
      expect(previewSpy).not.toHaveBeenCalled();
    });
  });
});
