import { useState, useEffect } from 'react'

type RequestOptions = {
  method: string,
  body?: object,
  cache?: string,
  credentials?: string,
  headers?: {
    Authorization?: string,
    ContentType?: string
  },
  mode?: string,
  redirect?: string,
  referrerPolicy?: string
};

const useFetch = <ResponseType>(url: string, { body, method }: RequestOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ResponseType>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (body) {
      fetch(url, {
        method: method,
        body: JSON.stringify(body)
      })
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
    }
    else {
      fetch(url, {
        method: method,
      })
        .then((result) => {
          result
            .json()
            .then((output: ResponseType) => {
              setIsLoading(false);
              console.log(output);
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
    }

  }, []);

  return { isLoading, data, error };
}

export { useFetch };