import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import type { authState } from "../../types/types";

const PrivateOnly = () => {
  const auth = useSelector((state: authState) => state.auth);

  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export default PrivateOnly;
