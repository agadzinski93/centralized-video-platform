import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import type { authState } from "../../types/types";

import "./NavBar.scss";

const NavBar = () => {
  const { isAuthenticated } = useSelector((state: authState) => state.auth);

  const handleApplyFocusOnSearch = () => {
    document.getElementById("search-form")?.focus();
  };

  const keypressEventForSearchForm = useCallback((e: KeyboardEvent) => {
    const element = document.activeElement;
    if (
      element?.tagName !== "INPUT" &&
      element?.tagName !== "TEXTAREA" &&
      e.key === "s"
    )
      handleApplyFocusOnSearch();
  }, []);

  useEffect(() => {
    document.addEventListener("keyup", keypressEventForSearchForm);

    return () =>
      document.removeEventListener("keyup", keypressEventForSearchForm);
  }, [keypressEventForSearchForm]);

  return (
    <nav>
      <div className="logo-search-container">
        <Link id="logo" className="logo-link" aria-label="Home page" to="/">
          <img src="/images/logo.png" alt="logo" height="100%" width="100%" />
        </Link>
      </div>

      <form className="search-bar" action="/search">
        <div className="search-key"></div>
        <input
          id="search-form"
          name="q"
          type="text"
          placeholder='Search videos (e.g. "Java", "Linux", "Variables", etc)'
          aria-label="Search videos"
        />
        <div className="search-icon" onClick={handleApplyFocusOnSearch}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0,0,256,256"
            width="100%"
            height="100%"
          >
            <g
              fill="#aaaaaa"
              fillRule="nonzero"
              stroke="none"
              strokeWidth="1"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              strokeDasharray=""
              strokeDashoffset="0"
              fontFamily="none"
              fontWeight="none"
              textAnchor="none"
              style={{ mixBlendMode: "normal" }}
            >
              <g transform="scale(5.12,5.12)">
                <path d="M21,3c-9.39844,0 -17,7.60156 -17,17c0,9.39844 7.60156,17 17,17c3.35547,0 6.46094,-0.98437 9.09375,-2.65625l12.28125,12.28125l4.25,-4.25l-12.125,-12.09375c2.17969,-2.85937 3.5,-6.40234 3.5,-10.28125c0,-9.39844 -7.60156,-17 -17,-17zM21,7c7.19922,0 13,5.80078 13,13c0,7.19922 -5.80078,13 -13,13c-7.19922,0 -13,-5.80078 -13,-13c0,-7.19922 5.80078,-13 13,-13z"></path>
              </g>
            </g>
          </svg>
        </div>
      </form>

      {isAuthenticated ? (
        <div tabIndex={0} className="menu-container">
          <div className="hamburger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 50"
              width="50px"
              height="50px"
            >
              <path
                fill="#ccc"
                d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"
              />
            </svg>
          </div>
          <menu>
            <Link to="/dashboard">
              <li>Dashboard</li>
            </Link>
            <Link to="/auth/logout">
              <li>Log Out</li>
            </Link>
          </menu>
        </div>
      ) : (
        <div className="nav-links">
          <Link className="btnSignIn" to="/auth/login">
            Sign In
          </Link>

          <Link className="btnSignIn" to="/auth/register">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
