import "./NavBar.scss";

const NavBar = () => {
  return (
    <nav>
      <div className="navLinks">
        <a href="/">Home</a>
      </div>
      <div className="navLinks">
        <a href="/auth/login">Sign In</a>
        <a href="/auth/register">Sign Up</a>
      </div>
    </nav>
  );
};

export default NavBar;
