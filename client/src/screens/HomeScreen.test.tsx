import { setupServer } from "msw/node";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach, test, expect } from "vitest";
import axe from "axe-core";
import { Provider } from "react-redux";
import store from "../redux/store.ts";

import HomeScreen from "./HomeScreen.tsx";
import { BrowserRouter } from "react-router-dom";
import { handlers } from "../../tests/handlers.ts";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const HomeScreenComponent = (
  <Provider store={store}>
    <HomeScreen />
  </Provider>
);

test("Test Home Page Loaded Content", async () => {
  const { container, findByText } = render(HomeScreenComponent, {
    wrapper: BrowserRouter,
  });
  let loader = document.querySelector(".home-page-loading-container");
  expect(loader).toBeInTheDocument();

  await waitFor(async () => {
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.incomplete.length).toBe(0);
    expect(results.violations.length).toBe(0);
  });

  loader = document.querySelector(".home-page-loading-container");
  expect(loader).not.toBeInTheDocument();

  expect(
    await findByText("How LEDs Work - Unravel the Mysteries of How LEDs Work!")
  ).toBeInTheDocument();
  expect(
    await findByText(
      "Single Phase Electricity Explained - wiring diagram energy meter"
    )
  ).toBeInTheDocument();
  expect(await findByText("Halo Full OST")).toBeInTheDocument();
});
