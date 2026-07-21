import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseCommandLocally } from './fallbackParser';

describe('parseCommandLocally', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles contextual share', () => {
    const result = parseCommandLocally('send this', 'weather');
    expect(result.summary).toBe('Contextual Share: weather');
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].action).toBe('read_content');
    expect(result.steps[0].target).toBe('screen_context');
  });

  it('handles complex routine: prepare for meeting', () => {
    const result = parseCommandLocally('prepare for meeting', 'home');
    expect(result.summary).toBe('Prepare for Meeting');
    expect(result.steps.some(s => s.target === 'toggle_dnd')).toBe(true);
    expect(result.steps.some(s => s.target === 'spotify')).toBe(true);
    expect(result.steps.some(s => s.target === 'email')).toBe(true);
  });

  it('handles complex routine: morning routine', () => {
    const result = parseCommandLocally('morning routine', 'home');
    expect(result.summary).toBe('Morning Briefing & Start Routine');
    expect(result.steps.some(s => s.target === 'weather')).toBe(true);
  });

  it('handles complex routine: social broadcast', () => {
    const result = parseCommandLocally('social broadcast music', 'home');
    expect(result.summary).toBe('Social Media Broadcast & Music Focus');
    expect(result.steps.some(s => s.target === 'twitter')).toBe(true);
  });

  it('handles complex routine: commute', () => {
    const result = parseCommandLocally('commute directions', 'home');
    expect(result.summary).toBe('Commute Calculator & Notifications');
    expect(result.steps.some(s => s.target === 'maps')).toBe(true);
  });

  it('handles utility query: weather in London', () => {
    const result = parseCommandLocally('weather in London', 'home');
    expect(result.summary).toBe('Check weather in London');
    expect(result.steps.some(s => s.target === 'weather')).toBe(true);
    expect(result.steps.some(s => s.action === 'type' && s.value === 'London')).toBe(true);
  });

  it('handles utility query: email boss', () => {
    const result = parseCommandLocally('email boss', 'home');
    expect(result.summary).toBe('Draft and send Email');
    expect(result.steps.some(s => s.target === 'email')).toBe(true);
    expect(result.steps.some(s => s.target === 'email_recipient' && s.value === 'boss@company.com')).toBe(true);
  });

  it('handles utility query: play chill music', () => {
    const result = parseCommandLocally('play chill music', 'home');
    expect(result.summary).toBe('Control Spotify Music Playback');
    expect(result.steps.some(s => s.target === 'spotify')).toBe(true);
  });

  it('handles device settings: turn on dark mode', () => {
    const result = parseCommandLocally('turn on dark mode', 'home');
    expect(result.summary).toBe('Modify Device System Settings');
    expect(result.steps.some(s => s.target === 'toggle_dark_mode')).toBe(true);
  });

  it('handles device settings: turn on bluetooth', () => {
    const result = parseCommandLocally('turn on bluetooth', 'home');
    expect(result.summary).toBe('Modify Device System Settings');
    expect(result.steps.some(s => s.target === 'toggle_bluetooth')).toBe(true);
  });

  it('handles smart home: toggle living room light', () => {
    const result = parseCommandLocally('toggle living room light', 'home');
    expect(result.summary).toBe('Smart Home Device Control');
    expect(result.steps.some(s => s.target === 'toggle_living_room_light')).toBe(true);
  });

  it('handles messaging: text sarah Hello', () => {
    const result = parseCommandLocally("texting 'Hello'", 'home');
    expect(result.summary).toBe('Send chat message to contact');
    expect(result.steps.some(s => s.target === 'chat_with_sarah')).toBe(true);
    expect(result.steps.some(s => s.target === 'messages_input_text' && s.value === 'Hello')).toBe(true);
  });

  it('handles general fallback', () => {
    const result = parseCommandLocally('do something random', 'home');
    expect(result.summary).toBe('Execute: do something random');
    expect(result.steps.some(s => s.target === 'settings')).toBe(true);
  });

  it('generates predictable IDs', () => {
    const result = parseCommandLocally('do something random', 'home');
    expect(result.steps[0].id).toBe('4fzzzxj-0');
    expect(result.steps[1].id).toBe('4fzzzxj-1');
  });
});
