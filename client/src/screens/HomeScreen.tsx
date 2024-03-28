import { useFetch } from "../hooks/useFetch";

import type { ApiResponse } from "../types/types";

const API_TARGET = `/api/v1/home`;

const HomeScreen = () => {
  const { isLoading, data, error } = useFetch<ApiResponse>(API_TARGET, {
    method: "GET",
  });

  const errorOutput = <div>{error && error.message}</div>;
  const dataOutput = (
    <div>{isLoading ? "Loading..." : data && data.message}</div>
  );

  return (
    <>
      {errorOutput}
      {dataOutput}
    </>
  );
};

export default HomeScreen;
