import { useState } from "react";
import { useLoginUserMutation } from "../redux/api/authApi";

type loginForm = {
  username: string;
  password: string;
};

const LoginScreen = () => {
  const [userData, setUserData] = useState<loginForm>({
    username: "",
    password: "",
  });
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const formHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const result = await loginUser(userData);
    console.log(result);
  };

  return (
    <div>
      <h1>Sign In</h1>
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
        <button>Sign In</button>
      </form>
    </div>
  );
};

export default LoginScreen;
