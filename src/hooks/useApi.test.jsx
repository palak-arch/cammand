import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useApi from './useApi';

describe('useApi', () => {
  it('resolves data and clears loading', async () => {
    const { result } = renderHook(() => useApi(async () => ['a', 'b'], []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(['a', 'b']);
    expect(result.current.error).toBeNull();
  });

  it('surfaces rejection messages as errors instead of hanging', async () => {
    const { result } = renderHook(() => useApi(async () => {
      throw new Error('boom');
    }, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(result.current.data).toBeNull();
  });

  it('falls back to a generic message for non-Error rejections', async () => {
    const { result } = renderHook(() => useApi(async () => {
      throw 'raw string failure';
    }, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Something went wrong while loading data.');
  });

  it('retry() refetches after a failure', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('first fails')).mockResolvedValueOnce('recovered');
    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => expect(result.current.error).toBe('first fails'));
    expect(fetcher).toHaveBeenCalledTimes(1);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toBe('recovered'));
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('re-runs the fetcher when dependencies change', async () => {
    const fetcher = vi.fn(async (id) => `value-${id}`);
    const { result, rerender } = renderHook(({ id }) => useApi(() => fetcher(id), [id]), {
      initialProps: { id: 1 },
    });

    await waitFor(() => expect(result.current.data).toBe('value-1'));
    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe('value-2'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('setData updates the loaded data', async () => {
    const { result } = renderHook(() => useApi(async () => [1, 2], []));
    await waitFor(() => expect(result.current.data).toEqual([1, 2]));

    act(() => result.current.setData((prev) => [...prev, 3]));
    expect(result.current.data).toEqual([1, 2, 3]);
  });
});
