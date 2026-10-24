import { describe, it, expect } from 'vitest';

import { DEMO_MODE, DEMO_USER } from './demoMode';

describe('demo mode gating', () => {
  it('stays off under the test runner even though DEV is true there', () => {
    // Vitest reports DEV:true, MODE:'test' — the MODE half of the gate is what
    // keeps session tests honest instead of auto-signing them in.
    expect(import.meta.env.DEV).toBe(true);
    expect(import.meta.env.MODE).toBe('test');
    expect(DEMO_MODE).toBe(false);
  });

  it('exposes a signed-in demo identity flagged as demo', () => {
    expect(DEMO_USER).toMatchObject({ signedIn: true, demo: true });
    expect(DEMO_USER.avatarUrl).toBeNull();
  });
});
