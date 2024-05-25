import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, logout } from "../../redux/slices/authSlice";
import { addMessage } from "../../redux/slices/flashMessageSlice";
import {
  useUsernameExistsMutation,
  useRegisterUserGoogleMutation,
} from "../../redux/api/authApi";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";

import { FieldValues } from "react-hook-form";
import { castApiResponse } from "../../types/types";

const LoginGoogleSuccess = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifyingUsername, setVerifyingUsername] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Verifying credentials..."
  );
  const [usernameExists] = useUsernameExistsMutation();
  const [needUsername, setNeedUsername] = useState(false);
  const [registerUserGoogle] = useRegisterUserGoogleMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Form-related Hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const registerUsingGoogle = async (data: FieldValues) => {
    try {
      setVerifyingUsername(true);
      setError(null);
      setLoadingMessage("Please wait...");

      const value = Cookies.get("tmp_user");

      if (value) {
        const user = JSON.parse(
          value.substring(value.indexOf(":") + 1, value.lastIndexOf("."))
        );
        if (!user.user_id || !user.email || !user.google_id)
          throw new Error(
            "Something went wrong. Email and Google ID should be present."
          );
        data["email"] = user.email;
        data["google_id"] = user.google_id;

        //Check if username exists first
        const output = await usernameExists({
          username: data["username"],
          email: data["email"],
          google_id: data["google_id"],
        });
        const result = castApiResponse(output);
        if (result.error) {
          if (result.error.data?.status === 400) {
            setError(result.error.data.message);
          } else {
            dispatch(
              addMessage({
                type: result.error.data.response,
                message:
                  result.error.data.message ||
                  "Error checking if username exists.",
              })
            );
          }
        } else {
          const response = await registerUserGoogle({
            username: data["username"],
            email: data["email"],
            google_id: data["google_id"],
          });
          const register_response = castApiResponse(response);
          if (register_response.error) {
            dispatch(
              addMessage({
                type: register_response.error.data.response,
                message:
                  register_response.error.data.message ||
                  register_response.error.error,
              })
            );
          } else {
            if (register_response.data) {
              setNeedUsername(false);
              dispatch(login(register_response.data));
              window.location.href = "/api/v1/auth/login/google";
            } else {
              throw new Error("Error registering user.");
            }
          }
        }
      } else {
        throw new Error("Something went wrong. Could not read cookie.");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        dispatch(addMessage({ type: "error", message: err.message }));
      }
      navigate("/auth/login");
    }
    setVerifyingUsername(false);
  };

  const fetchUserCredentials = async () => {
    try {
      const response = await fetch("/api/v1/auth/getCredentials", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Retrieving authentication details failed.");
      return err;
    }
  };

  useEffect(() => {
    document.title = "Register | Centralized Video Title";
  }, []);

  useEffect(() => {
    if (errors.username) {
      setFormErrors(true);
    } else {
      setFormErrors(false);
    }
  }, [errors.username]);

  useEffect(() => {
    const value = Cookies.get("tmp_user");
    if (value) {
      try {
        const user = JSON.parse(
          value.substring(value.indexOf(":") + 1, value.lastIndexOf("."))
        );
        if (!user.user_id || !user.email || !user.google_id)
          throw new Error(
            "Something went wrong. Email and Google ID should be present."
          );
        setNeedUsername(true);
        setIsLoading(false);
      } catch (err) {
        console.error((err as Error).message);
      }
    } else {
      fetchUserCredentials()
        .then((data) => {
          setIsLoading(false);
          if (data.data.google_id) {
            setNeedUsername(false);
            dispatch(login(data.data));
            navigate("/dashboard");
          } else {
            setNeedUsername(true);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err.message);
          dispatch(logout());
          navigate("/auth/login");
        });
    }
    setIsLoading(false);
  }, []);

  const usernameForm = (
    <>
      <h1>Choose a username</h1>
      <p className="google-select-username-message">
        You don't seem to have an account. Choose a username to sign up using
        Google
      </p>
      {error && <p className="sign-in-error">{error}</p>}
      <form onSubmit={handleSubmit(registerUsingGoogle)}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          placeholder="Enter username here"
          className={errors.username ? "error" : ""}
          {...register("username", {
            required: true,
            minLength: 3,
            maxLength: 24,
          })}
        />
        {errors.username && (
          <p className="input-error">
            Username must be from 3 to 24 characters.
          </p>
        )}
        <div className="sign-in-button-container google-sign-in-button-container">
          {verifyingUsername ? (
            <div className="sign-in-spinner"></div>
          ) : (
            <button
              className={formErrors ? "sign-in-button-disabled" : ""}
              type="submit"
              disabled={formErrors}
            >
              Sign Up
            </button>
          )}
        </div>
      </form>
    </>
  );

  return (
    <div className="sign-in-page-container">
      <div className="sign-in-form-container">
        {isLoading ? (
          <>
            <p className="google-loading-message">{loadingMessage}</p>
            <div className="sign-in-spinner"></div>
          </>
        ) : needUsername ? (
          usernameForm
        ) : (
          <p>Thanks for logging in...</p>
        )}
      </div>
    </div>
  );
};

export default LoginGoogleSuccess;
