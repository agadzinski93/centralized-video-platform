import { useState, useEffect } from 'react'

type ApiResponse = {
  response: string,
  status: number,
  message: string,
  previousUrl: string,
  data?: object
}

const useFetch = (url: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ApiResponse>({ response: '', status: 0, message: '', previousUrl: '' });
  const [error, setError] = useState<Error>();

  useEffect(() => {
    fetch(url, {
      method: "GET",
    })
      .then((result) => {
        result
          .json()
          .then((output: ApiResponse) => {
            setIsLoading(false);
            setData(output);
            console.log(output);
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