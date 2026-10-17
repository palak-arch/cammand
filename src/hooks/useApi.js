import { useCallback, useEffect, useRef, useState } from 'react';

function messageFrom(error, fallback) {
  if (error && typeof error.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}

/**
 * Loads async data with loading/error state, a retry() and a safe setData().
 *
 *   const { data, loading, error, retry, setData } = useApi(() => service.getAll(), [id]);
 *
 * Failed requests always resolve to an error message instead of leaving the UI stuck.
 * setState is skipped if the component unmounted or dependencies changed mid-flight.
 */
export default function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    Promise.resolve()
      .then(() => fetcherRef.current())
      .then(
        (data) => {
          if (active) setState({ data, loading: false, error: null });
        },
        (error) => {
          if (active) {
            setState({
              data: null,
              loading: false,
              error: messageFrom(error, 'Something went wrong while loading data.'),
            });
          }
        }
      );

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...deps]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater,
    }));
  }, []);

  return { ...state, retry, setData };
}