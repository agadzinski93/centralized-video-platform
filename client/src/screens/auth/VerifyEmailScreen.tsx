import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useVerifyEmailMutation } from "../../redux/api/authApi";
import { addMessage } from "../../redux/slices/flashMessageSlice";
import { castApiResponse } from "../../types/types";

import "./VerifyEmailScreen.scss";

const VerifyEmailScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId, key } = useParams();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();

  useEffect(() => {
    if (userId && key) {
      verifyEmail({ userId, key })
        .then((res) => {
          const response = castApiResponse(res);
          if (response.data) {
            dispatch(
              addMessage({
                type: response.data.response,
                message: response.data.message,
              })
            );
          } else if (response.error) {
            dispatch(
              addMessage({
                type: response.error.data.response,
                message: response.error.data.message,
              })
            );
          } else {
            dispatch(
              addMessage({
                type: "error",
                message: "Something odd happened. Try again later.",
              })
            );
          }
          navigate("/");
        })
        .catch((err) => {
          dispatch(addMessage({ type: "error", message: err.message }));
          navigate("/");
        });
    }
  }, []);

  return (
    <div className="verifying-email-page-container">
      <div className="verify-email-container">
        <h1>Verifying email. Please wait...</h1>
        {isLoading && <div className="verify-email-spinner"></div>}
      </div>
    </div>
  );
};

export default VerifyEmailScreen;
