import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutUserMutation } from "../redux/api/authApi";
import { useNavigate } from "react-router-dom";
import { castApiResponse } from "../types/types";

const LogoutScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser, { isLoading, isError }] = useLogoutUserMutation();

  const logoutHandler = useCallback(async () => {
    const output = await logoutUser(null);
    const result = castApiResponse(output);
    return result;
  }, [logoutUser]);

  useEffect(() => {
    logoutHandler()
      .then((data) => {
        if (data.data?.response === "success") {
          dispatch(logout());
        }
        navigate("/");
      })
      .catch((err) => {
        if (err.data?.response === "error") {
          dispatch(logout());
        }
        navigate("/");
      });
  }, [logoutHandler, dispatch, navigate]);

  return (
    <>
      {isError && <p>{isError}</p>}
      {isLoading ? (
        <p>Logging Out...</p>
      ) : (
        <p>Successfully logged out. Redirecting...</p>
      )}
    </>
  );
};

export default LogoutScreen;
