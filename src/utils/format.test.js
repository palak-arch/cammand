import { describe, it, expect } from 'vitest';
import { formatAuthReturnPath, authReturnQuery } from './format';

describe('formatAuthReturnPath', () => {
  it('accepts a same-site path', () => {
    expect(formatAuthReturnPath('?authReturnTo=/instances')).toBe('/instances');
  });

  it('keeps the query string of the requested page', () => {
    expect(formatAuthReturnPath('?authReturnTo=%2Finstances%3Fregion%3Dus-east-1')).toBe(
      '/instances?region=us-east-1'
    );
  });

  it('returns null when there is no param', () => {
    expect(formatAuthReturnPath('')).toBeNull();
    expect(formatAuthReturnPath('?other=value')).toBeNull();
  });

  it('rejects anything that could leave the site', () => {
    expect(formatAuthReturnPath('?authReturnTo=//evil.example/phish')).toBeNull();
    expect(formatAuthReturnPath('?authReturnTo=https://evil.example')).toBeNull();
    expect(formatAuthReturnPath('?authReturnTo=dashboard')).toBeNull();
  });
});

describe('authReturnQuery', () => {
  it('encodes the requested location', () => {
    expect(authReturnQuery({ pathname: '/instances', search: '?region=us-east-1' })).toBe(
      '?authReturnTo=%2Finstances%3Fregion%3Dus-east-1'
    );
  });

  it('is empty on the landing page itself', () => {
    expect(authReturnQuery({ pathname: '/', search: '' })).toBe('');
  });
});
