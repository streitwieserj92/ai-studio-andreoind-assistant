import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AgentControlPanel from "./AgentControlPanel";
import { addDoc, getDocs } from "@/src/lib/firebase";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock lucide-react to avoid SVG rendering issues in tests
vi.mock("lucide-react", () => {
  return {
    Send: () => <span data-testid="icon-Send" />,
    Zap: () => <span data-testid="icon-Zap" />,
    Play: () => <span data-testid="icon-Play" />,
    RotateCcw: () => <span data-testid="icon-RotateCcw" />,
    Sparkles: () => <span data-testid="icon-Sparkles" />,
    Layers: () => <span data-testid="icon-Layers" />,
    History: () => <span data-testid="icon-History" />,
    Trash2: () => <span data-testid="icon-Trash2" />,
    Clock: () => <span data-testid="icon-Clock" />,
    Settings: () => <span data-testid="icon-Settings" />,
    ShieldCheck: () => <span data-testid="icon-ShieldCheck" />,
    AlertCircle: () => <span data-testid="icon-AlertCircle" />,
    HelpCircle: () => <span data-testid="icon-HelpCircle" />,
    Mic: () => <span data-testid="icon-Mic" />,
    Save: () => <span data-testid="icon-Save" />,
    Bookmark: () => <span data-testid="icon-Bookmark" />,
    X: () => <span data-testid="icon-X" />,
  };
});

// Mock firebase
vi.mock("@/src/lib/firebase", () => ({
  db: {},
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

describe("AgentControlPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.getItem = vi.fn(() => null);

    // Mock getDocs to return an empty snapshot so loadTemplates doesn't crash with undefined
    vi.mocked(getDocs).mockResolvedValue({
      empty: true,
      docs: [],
    } as any);
  });

  const defaultProps = {
    inputCommand: "Test command",
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

  it("saves template to localStorage fallback when Firestore fails", async () => {
    // Suppress console.error in this test specifically for the expected Firestore error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const user = userEvent.setup();
    // Make addDoc throw an error
    vi.mocked(addDoc).mockRejectedValueOnce(new Error("Firestore error"));

    // Mock prompt
    window.prompt = vi.fn().mockReturnValue("My Template");

    render(<AgentControlPanel {...defaultProps} />);

    const saveIcon = screen.getByTestId("icon-Save");
    const saveButton = saveIcon.closest("button");

    expect(saveButton).not.toBeNull();

    // Click the button
    await user.click(saveButton as HTMLButtonElement);

    await waitFor(() => {
      // Check that localStorage was called
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "android_agent_templates",
        expect.any(String),
      );

      // Parse the saved string to check its contents
      const savedCalls = vi.mocked(localStorage.setItem).mock.calls;
      const templatesArg = JSON.parse(savedCalls[0][1]);

      // Ensure the fallback logic applied a local_ ID and saved the new template
      expect(templatesArg.length).toBeGreaterThan(0);
      const savedTemplate = templatesArg[templatesArg.length - 1];
      expect(savedTemplate.id).toMatch(/^local_\d+$/);
      expect(savedTemplate.title).toBe("📌 My Template");
      expect(savedTemplate.command).toBe("Test command");
    });

    consoleSpy.mockRestore();
  });
});
