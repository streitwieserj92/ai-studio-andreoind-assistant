import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AgentControlPanel from '../AgentControlPanel';

// Mock Firebase module
vi.mock('@/src/lib/firebase', () => ({
  db: {},
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

import { getDocs } from '@/src/lib/firebase';

describe('AgentControlPanel localStorage fallback', () => {
  const mockProps = {
    inputCommand: '',
    setInputCommand: vi.fn(),
    handleSubmitCommand: vi.fn(),
    isLoading: false,
    activeRun: null,
    historyRuns: [],
    handleSelectPreset: vi.fn(),
    handleClearHistory: vi.fn(),
    handleDeleteHistoryItem: vi.fn(),
    agentSpeed: 1,
    setAgentSpeed: vi.fn(),
    isFallbackActive: false,
  };

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let localStorageGetSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock getDocs to simulate a Firestore failure
    vi.mocked(getDocs).mockRejectedValue(new Error('Firestore fetch failed'));

    // Mock console.error to keep test output clean
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Spy on localStorage
    localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to DEFAULT_TEMPLATES when localStorage has invalid JSON', async () => {
    // Simulate invalid JSON in localStorage
    localStorageGetSpy.mockReturnValue('invalid { json');

    render(<AgentControlPanel {...mockProps} />);

    // Wait for the component to finish loading and update templates
    await waitFor(() => {
      // The default template title should be visible if fallback occurred
      expect(screen.getByText('🌅 Start my workday routine')).toBeInTheDocument();
    });

    // Ensure the firestore error was triggered and handled
    expect(getDocs).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Error loading from Firestore, falling back to localStorage/defaults',
      expect.any(Error)
    );
    expect(localStorage.getItem).toHaveBeenCalledWith('android_agent_templates');
  });
});
