import { useSelector } from "react-redux";

import type { authState } from "../types/types";

import "./NavBar.scss";

const NavBar = () => {
  const { token } = useSelector((state: authState) => state.auth);

  return (
    <nav>
      <div className="navLinks">
        <a href="/">Home</a>
      </div>
      <div className="navLinks">
        {token ? (
          <>
            <a href="/auth/logout">Log Out</a>
          </>
        ) : (
          <>
            <a href="/auth/login">Sign In</a>
            <a href="/auth/register">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
