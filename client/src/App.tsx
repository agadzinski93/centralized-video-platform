import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.tsx";

function App() {
  return (
    <>
      <header>
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
