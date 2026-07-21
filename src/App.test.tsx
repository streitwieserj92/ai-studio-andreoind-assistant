import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('App Component', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let localStorageGetItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error output during test
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage
    localStorageGetItemSpy = vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles invalid localStorage JSON gracefully', () => {
    // Arrange
    localStorageGetItemSpy.mockImplementation((key) => {
      if (key === 'android_agent_history') {
        return 'invalid-json{]';
      }
      return null;
    });

    // Act
    render(<App />);

    // Assert
    expect(localStorageGetItemSpy).toHaveBeenCalledWith('android_agent_history');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load history from localStorage:',
      expect.any(SyntaxError)
    );
  });
});
