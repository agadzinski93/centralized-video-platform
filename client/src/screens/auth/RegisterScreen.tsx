import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterUserMutation } from "../../redux/api/authApi";
import { castApiResponse } from "../../types/types";
import { useDispatch } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { addMessage } from "../../redux/slices/flashMessageSlice";

import "./LoginScreen.scss";

const RegisterScreen = () => {
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<boolean>(false);
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validatePasswords = (val: string) => {
    if (watch("password") != val) {
      return "Passwords do not match.";
    }
  };

  const submitHandler = async (data: FieldValues) => {
    setError(null);

    const output = await registerUser({
      username: data["username"],
      email: data["email"],
      password: data["password"],
      confirmPassword: data["repeatPassword"],
    });
    const result = castApiResponse(output);

    if (result.error) {
      if (result.error.data.status === 400) {
        setError(result.error.data.message);
      } else {
        dispatch(
          addMessage({
            type: result.error.data.response,
            message: result.error.data.message,
          })
        );
      }
    } else {
      if (result?.data) {
        dispatch(
          addMessage({
            type: result.data.response,
            message: result.data.message,
          })
        );
      }
      navigate("/");
    }
  };

  const googleRedirect = async () => {
    window.location.assign("/api/v1/auth/login/google");
  };

  useEffect(() => {
    document.title = "Register | Centralized Video Title";
  }, []);

  useEffect(() => {
    if (errors.username || errors.email || errors.password) {
      setFormErrors(true);
    } else {
      setFormErrors(false);
    }
  }, [errors.username, errors.email, errors.password]);

  return (
    <div className="sign-in-page-container">
      <div className="sign-in-form-container">
        <h1>Sign Up</h1>
        {error && <p className="sign-in-error">{error}</p>}
        <form onSubmit={handleSubmit(submitHandler)}>
          <label htmlFor="main">Username</label>
          <input
            type="text"
            id="main"
            placeholder="Enter username"
            className={errors.username ? "error" : ""}
            {...register("username", {
              required: true,
              minLength: 3,
              maxLength: 24,
            })}
          />
          {errors.username && (
            <p className="input-error">
              Username must be between 3 and 24 characters.
            </p>
          )}
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            placeholder="Enter email"
            className={errors.email ? "error" : ""}
            {...register("email", { required: true })}
          />
          {errors.email && <p className="input-error">Email is required.</p>}
          <label htmlFor="password">Password</label>
          <input
            type="text"
            id="password"
            placeholder="Enter password"
            className={errors.password ? "error" : ""}
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="input-error">Password is required.</p>
          )}
          <label htmlFor="repeatPassword">Confirm Password</label>
          <input
            type="text"
            id="repeatPassword"
            placeholder="Enter password"
            className={errors.repeatPassword ? "error" : ""}
            {...register("repeatPassword", {
              required: true,
              validate: validatePasswords,
            })}
          />
          {errors.repeatPassword && (
            <p className="input-error">Please confirm your password.</p>
          )}
          <div className="sign-in-button-container">
            {isLoading ? (
              <div className="sign-in-spinner"></div>
            ) : (
              <>
                <button
                  className={formErrors ? "sign-in-button-disabled" : ""}
                  type="submit"
                  disabled={formErrors}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className="btn-google"
                  onClick={googleRedirect}
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ backgroundColor: "#FFF" }}
                    height="1rem"
                    width="1rem"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}
          </div>
        </form>
        <div className="not-signed-in-link-container">
          <p>
            Already have an account? <Link to="/auth/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
