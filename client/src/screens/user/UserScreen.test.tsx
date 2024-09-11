import { render, screen, act, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { test, expect, beforeAll, afterEach, afterAll, vitest } from "vitest";
import { setupServer } from "msw/node";
import axe from "axe-core";
import { Provider } from "react-redux";
import store from "../../redux/store.ts";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../../routes/routes.tsx";
import { handlers } from "../../../tests/handlers.ts";

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
        const mockParams = { username: "admin" };
        return mockParams;
      },
    };
  });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Testing User Screen", async () => {
  const user = userEvent.setup();
  const router = createMemoryRouter(routes, {
    initialEntries: ["/user/admin"],
    initialIndex: 1,
  });

  const { container } = await act(async () =>
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    )
  );

  await waitFor(() => {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("admin");
    expect(screen.queryByText("View All")).toBeNull();
  });

  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(results.incomplete.length).toBe(0);
  expect(results.violations.length).toBe(0);

  //Test clicking the 'Videos' button
  await act(
    async () => await user.click(screen.getByRole("button", { name: "Videos" }))
  );
  await waitFor(() => {
    expect(screen.getByText("View All")).toBeInTheDocument();
    expect(
      screen.getByText("How ELECTRICITY works - working principle")
    ).toBeInTheDocument();
  });

  //Test clicking the 'About' button
  await act(
    async () => await user.click(screen.getByRole("button", { name: "About" }))
  );
  await waitFor(() => {
    expect(
      screen.queryByText("How ELECTRICITY works - working principle")
    ).toBeNull();
    expect(screen.getByText("Joined")).toBeInTheDocument();
    expect(screen.getByText("Tue Jan 03 2023")).toBeInTheDocument();
  });
});
