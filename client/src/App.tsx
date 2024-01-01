import { useFetch } from "./hooks/useFetch";

import "./App.scss";

const PATH = "http://localhost:5000/home";

function App() {
  const { isLoading, data, error } = useFetch(PATH);

  const errorOutput = <>{error && error.message}</>;
  const dataOutput = <>{isLoading ? "Loading?" : data && data.message}</>;

  return (
    <>
      {errorOutput}
      {dataOutput}
    </>
  );
}

export default App;
