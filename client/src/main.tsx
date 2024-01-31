import ReactDOM from "react-dom/client";
import store from "./redux/store.ts";
import { Provider } from "react-redux";
import App from "./App.tsx";
import HomeScreen from "./screens/HomeScreen.tsx";
import RegisterScreen from "./screens/RegisterScreen.tsx";
import LoginScreen from "./screens/LoginScreen.tsx";

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
      <Route path="/auth/register" element={<RegisterScreen />} />
      <Route path="/auth/login" element={<LoginScreen />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
