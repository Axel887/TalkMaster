// import { useCallback, useEffect, useState } from 'react';

// type Filters = Record<string, string | number | boolean | undefined>;

// interface UseApiQueryResult<T> {
//     data: T | null;
//     loading: boolean;
//     error: string | null;
//     refetch: () => void;
// }

// export function useApiQuery<T>(
//     url: string,
//     method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
//     body?: object,
//     filters?: Filters
// ): UseApiQueryResult<T> {
//     const [data, setData] = useState<T | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const fetchData = useCallback(() => {
//         setLoading(true);
//         setError(null);

//         const queryParams =
//             method === 'GET' && filters
//                 ? '?' +
//                 new URLSearchParams(
//                     Object.entries(filters)
//                         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//                         .filter(([_, v]) => v !== undefined)
//                         .map(([k, v]) => [k, String(v)])
//                 ).toString()
//                 : '';

//         fetch(`${import.meta.env.VITE_API_HOST}/${url}${queryParams}`, {
//             method,
//             mode: 'cors',
//             credentials: 'include',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
//         })
//             .then((res) => {
//                 if (!res.ok) {
//                     return res.text().then((text) => {
//                         throw new Error(text || `Erreur ${res.status}`);
//                     });
//                 }
//                 return res.json();
//             })
//             .then((json) => setData(json as T))
//             .catch((err) => setError(err.message || 'Une erreur est survenue'))
//             .finally(() => setLoading(false));
//     }, [body, filters, method, url]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData, url]);

//     return { data, loading, error, refetch: fetchData };
// }


import { useState } from 'react';

type Filters = Record<string, string | number | boolean | undefined>;

interface UseApiQueryOptions {
  filters?: Filters;
  body?: object;
}

interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiQuery<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): [
  (options?: UseApiQueryOptions) => Promise<UseApiQueryResult<T>>,
  UseApiQueryResult<T>
] {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApi = (options?: UseApiQueryOptions): Promise<UseApiQueryResult<T>> => {
    setLoading(true);
    setError(null);

    const queryParams =
      method === 'GET' && options?.filters
        ? '?' +
          new URLSearchParams(
            Object.entries(options.filters)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : '';

    return fetch(`${import.meta.env.VITE_API_HOST}/${url}${queryParams}`, {
      method,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' && options?.body ? JSON.stringify(options.body) : undefined,
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || `Erreur ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json) => {
        setData(json as T);
        return { data: json as T, loading: false, error: null };
      })
      .catch((err) => {
        const message = err.message || 'Une erreur est survenue';
        setError(message);
        return { data: null, loading: false, error: message };
      })
      .finally(() => setLoading(false));
  };

  return [fetchApi, { data, loading, error }];
}
