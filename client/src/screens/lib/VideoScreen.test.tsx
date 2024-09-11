import { setupServer } from "msw/node";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach, test, expect, vitest } from "vitest";
import axe from "axe-core";
import { Provider } from "react-redux";
import store from "../../redux/store.ts";
import VideoScreen from "./VideoScreen.tsx";
import { BrowserRouter } from "react-router-dom";
import { handlers } from "../../../tests/handlers.js";

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  const mockIntersectionObserver = vitest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;

  vitest.mock("react-router-dom", async () => {
    const props = await vitest.importActual("react-router-dom");
    return {
      ...props,
      useParams: () => {
        const mockParams = { topic: "Java-Programming", video: "N8LDSryePuc" };
        return mockParams;
      },
    };
  });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Test Video Page Loaded Content", async () => {
  const { container, getByText } = render(
    <Provider store={store}>
      <VideoScreen />
    </Provider>,
    {
      wrapper: BrowserRouter,
    }
  );
  let loader = document.querySelector(".loading-video-container");
  expect(loader).toBeInTheDocument();

  await waitFor(async () => {
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.incomplete.length).toBe(0);
    expect(results.violations.length).toBe(0);
  });
  loader = document.querySelector(".loading-video-container");
  expect(loader).not.toBeInTheDocument();

  //Video Info
  let div = document.querySelector(".video-title");
  expect(div).toBeInTheDocument();
  expect(div?.textContent).toBe("Introduction to Variables in Java");
  div = document.querySelector(".video-description");
  expect(div).toBeInTheDocument();

  //Author Info
  div = document.querySelector(".username > a");
  expect(div).toBeInTheDocument();
  expect(div?.textContent).toBe("admin2");

  //Sample Video Titles in Playlist
  expect(getByText("Java Basics - An Overview")).toBeInTheDocument();
  expect(getByText("Identifiers in Java")).toBeInTheDocument();
});
