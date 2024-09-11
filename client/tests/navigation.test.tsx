import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { test, expect, beforeAll, afterEach, afterAll, vitest } from "vitest";
import { setupServer } from "msw/node";
import { Provider } from "react-redux";
import store from "../src/redux/store.ts";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../src/routes/routes.tsx";
import { handlers } from "./handlers.ts";

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

test("User loads home page and navigates to topic and video pages.", async () => {
  const user = userEvent.setup();
  //Setup React Router and Set user on Home Page
  const router = createMemoryRouter(routes, {
    initialEntries: ["/"],
    initialIndex: 1,
  });

  //Load Home Page
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );

  //Test Home Page Content
  let topicLinks: HTMLElement | HTMLElement[] | null = null;
  let heading = screen.getByRole("heading", { level: 1 });

  waitFor(() =>
    expect(screen.getByText("Java Programming")).toBeInTheDocument()
  );

  topicLinks = screen.queryAllByRole("link", { name: "Watch Now →" });
  waitFor(() => expect(topicLinks).toHaveLength(6));

  //Navigate to Topic Page
  if (topicLinks && Array.isArray(topicLinks)) await user.click(topicLinks[1]);

  heading = await waitFor(
    async () => await screen.findByRole("heading", { level: 1 })
  );
  waitFor(() => expect(heading.textContent).toBe("Java Programming"));
  topicLinks = screen.queryAllByRole("link");
  waitFor(() => expect(topicLinks).toHaveLength(5));

  //Navigate to Video Page
  if (topicLinks && Array.isArray(topicLinks)) await user.click(topicLinks[3]);

  heading = await waitFor(
    async () => await screen.findByRole("heading", { level: 1 })
  );
  waitFor(() => expect(heading.textContent).toBe("Constants in Java"));
});
