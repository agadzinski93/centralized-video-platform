import { useSearchParams } from "react-router-dom";

import "./SearchScreen.scss";

const SearchScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return <div>Search results for '{searchParams.get("q")}'</div>;
};

export default SearchScreen;
