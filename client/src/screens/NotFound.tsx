import { useEffect } from "react";

import "./NotFound.scss";

const NotFound = () => {
  useEffect(() => {
    document.title = "404 Not Found | Centralized Video Platform";
  }, []);

  return <h1 className="not-found-header">404 Not Found</h1>;
};

export default NotFound;
