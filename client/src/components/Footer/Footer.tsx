import "./Footer.scss";

const Footer = () => {
  return (
    <>
      {"Copyright "}
      &copy;
      {` ${new Date().getFullYear()} Centralized Video Platform.`}
    </>
  );
};

export default Footer;
