import { SyntheticEvent, useState } from "react";
import { useLoginUserMutation } from "../redux/api/authApi";
import { castApiResponse } from "../types/types";
import { useDispatch } from "react-redux";
import { setToken, logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

type loginForm = {
  username: string;
  password: string;
};

const LoginScreen = () => {
  const [userData, setUserData] = useState<loginForm>({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formHandler = (e: SyntheticEvent) => {
    setUserData((prevState) => ({
      ...prevState,
      [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement)
        .value,
    }));
  };

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();
    const output = await loginUser(userData);
    const result = castApiResponse(output);
    if (result.error) {
      dispatch(logout());
      setLoginError(result.error.data.message);
    } else {
      dispatch(setToken(result.data?.data));
      setLoginError(null);
      navigate("/");
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      {loginError && <p>{loginError}</p>}
      <form onSubmit={submitHandler}>
        <label htmlFor="username">Username: </label>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Enter username"
          onChange={formHandler}
        />
        <label htmlFor="password">Password: </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter password"
          onChange={formHandler}
        />
        {!isLoading && <button>Sign In</button>}
      </form>
    </div>
  );
};

export default LoginScreen;
