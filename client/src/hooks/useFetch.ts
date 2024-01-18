import { useState, useEffect } from 'react'

const useFetch = <ResponseType>(url: string, options: RequestInit) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ResponseType>();
  const [error, setError] = useState<Error>();

  useEffect(() => {

    fetch(url, options)
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
  }, []);

  return { isLoading, data, error };
}

export { useFetch };