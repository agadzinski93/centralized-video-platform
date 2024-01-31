import ReactDOM from "react-dom/client";
import store from "./redux/store.ts";
import { Provider } from "react-redux";
import App from "./App.tsx";
import PublicOnly from "./components/auth/PublicOnly.tsx";
import PrivateOnly from "./components/auth/PrivateOnly.tsx";
import HomeScreen from "./screens/HomeScreen.tsx";
import RegisterScreen from "./screens/RegisterScreen.tsx";
import LoginScreen from "./screens/LoginScreen.tsx";
import LogoutScreen from "./screens/LogoutScreen.tsx";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

import "./index.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="" element={<PublicOnly />}>
        <Route path="/auth/register" element={<RegisterScreen />} />
        <Route path="/auth/login" element={<LoginScreen />} />
      </Route>
      <Route path="" element={<PrivateOnly />}>
        <Route path="/auth/logout" element={<LogoutScreen />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
