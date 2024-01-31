import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import type { authState } from "../../types/types";

const PublicOnly = () => {
  const auth = useSelector((state: authState) => state.auth);

  return !auth.token ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export default PublicOnly;
