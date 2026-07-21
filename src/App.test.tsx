import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock Firebase to suppress network warnings during tests
vi.mock('@/src/lib/firebase', () => ({
  db: {},
  collection: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    docs: [],
    forEach: (cb: any) => []
  }),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  it('handles fetch 403 API_KEY_MISSING error and falls back to local parsing', async () => {
    // Mock fetch to return 403
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    render(<App />);

    // Find input and submit button
    const input = screen.getByPlaceholderText(/Command Aura:/i);
    // Since there are multiple buttons or we might just submit the form
    fireEvent.change(input, { target: { value: 'Test command' } });

    // We can submit the form directly by firing submit on it, or clicking the button
    // The button has a Zap icon or we can use the closest form
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Verify fetch was called with correct arguments
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agent/parse', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test command'),
      }));
    });

    // Verify fallback UI appears ("Local NLP: V1.0")
    await waitFor(() => {
      expect(screen.getByText(/Local NLP: V1.0/i)).toBeInTheDocument();
    });

    // Verify fallback logs
    await waitFor(() => {
      expect(screen.getByText(/\[Warning\] Google Gemini API Key is missing from Secrets./i)).toBeInTheDocument();
      expect(screen.getByText(/\[Agent\] Booting local heuristic NLP compiler\.\.\./i)).toBeInTheDocument();
    });
  });

  it('handles fetch network error and falls back to local parsing', async () => {
    // Mock fetch to reject (network error)
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    const input = screen.getByPlaceholderText(/Command Aura:/i);
    fireEvent.change(input, { target: { value: 'Another test command' } });

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Verify fallback UI appears
    await waitFor(() => {
      expect(screen.getByText(/Local NLP: V1.0/i)).toBeInTheDocument();
    });

    // Verify network error logs
    await waitFor(() => {
      expect(screen.getByText(/\[Warning\] Server parsing error\. Network or API is unresponsive\./i)).toBeInTheDocument();
      expect(screen.getByText(/\[Agent\] Booting local heuristic NLP compiler\.\.\./i)).toBeInTheDocument();
    });
  });
});
