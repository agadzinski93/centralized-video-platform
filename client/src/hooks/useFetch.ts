import { useState, useEffect } from 'react'

const useFetch = <ResponseType>(url: string | null, options: RequestInit | null = null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ResponseType>();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (url) {
      fetch(url, (options) ? options : undefined)
        .then((result) => {
          result
            .json()
            .then((output: ResponseType) => {
              setIsLoading(false);
              setData(output);
            })
            .catch((err) => {
              setIsLoading(false);
              setError(err);
              console.error(err.message);
            });
        })
        .catch((err) => {
          setIsLoading(false);
          setError(err);
          console.error(err.message);
        });
    } else {
      setIsLoading(false);
    }

  }, []);

  return { isLoading, data, error };
}

export { useFetch };