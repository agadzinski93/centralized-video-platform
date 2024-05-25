import "./SkipLink.scss";

const handleFocusOnMain = (e: React.KeyboardEvent<HTMLDivElement>) => {
  e.preventDefault();
  if (e.key === "Enter") {
    const main = document.getElementById("main");
    if (main) {
      main.focus();
    } else {
      document.getElementById("logo")?.focus();
    }
  } else if (e.key === "Tab") {
    document.getElementById("logo")?.focus();
  }
};

const SkipLink = () => {
  return (
    <div tabIndex={0} className="skip-link" onKeyDown={handleFocusOnMain}>
      Skip to Main Content (Enter)
    </div>
  );
};

export default SkipLink;
