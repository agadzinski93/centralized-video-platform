import ReactDOM from "react-dom/client";
import store from "./redux/store.ts";
import { Provider } from "react-redux";
import App from "./App.tsx";
import PublicOnly from "./components/auth/PublicOnly.tsx";
import PrivateOnly from "./components/auth/PrivateOnly.tsx";
import HealthScreen from "./screens/HealthScreen.tsx";
import HomeScreen from "./screens/HomeScreen.tsx";
import SearchScreen from "./screens/SearchScreen.tsx";
import RegisterScreen from "./screens/auth/RegisterScreen.tsx";
import LoginScreen from "./screens/auth/LoginScreen.tsx";
import LoginGoogleSuccess from "./screens/auth/LoginGoogleSuccess.tsx";
import VerifyEmailScreen from "./screens/auth/VerifyEmailScreen.tsx";
import LogoutScreen from "./screens/auth/LogoutScreen.tsx";
import TopicScreen from "./screens/lib/TopicScreen.tsx";
import VideoScreen from "./screens/lib/VideoScreen.tsx";
import UserScreen from "./screens/user/UserScreen.tsx";
import Dashboard from "./components/User/Dashboard.tsx";
import NotFound from "./screens/NotFound.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

import "./reset.scss";
import "./App.scss";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="/search" element={<SearchScreen />} />
      <Route path="/auth/logout" element={<LogoutScreen />} />
      <Route
        path="/auth/login/google/success"
        element={<LoginGoogleSuccess />}
      />
      <Route
        path="/auth/:userId/verifyEmail/:key"
        element={<VerifyEmailScreen />}
      />
      <Route path="/lib/:topic" element={<TopicScreen />} />
      <Route path="/lib/:topic/:video" element={<VideoScreen />} />
      <Route path="/user/:username" element={<UserScreen />} />
      <Route path="/health" element={<HealthScreen />} />
      <Route path="" element={<PublicOnly />}>
        <Route path="/auth/register" element={<RegisterScreen />} />
        <Route path="/auth/login" element={<LoginScreen />} />
      </Route>
      <Route path="" element={<PrivateOnly />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
