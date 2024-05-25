import { Outlet } from "react-router-dom";
import SkipLink from "./components/Header/SkipLink.tsx";
import NavBar from "./components/Header/NavBar.tsx";
import Footer from "./components/Footer/Footer.tsx";
import FlashMessages from "./components/FlashMessages/FlashMessages.tsx";

function App() {
  return (
    <>
      <header>
        <SkipLink />
        <NavBar />
        <FlashMessages />
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}

export default App;
