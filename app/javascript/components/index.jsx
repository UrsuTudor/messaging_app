import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

document.addEventListener("turbo:load", () => {
  const reactRoot = document.getElementById("react-root");

  if (reactRoot) {
    const root = createRoot(reactRoot);
    root.render(<App />);
  }
});

// choose a font, font size and color
// write frontend tests and update backend tests to test pagy
// add css to login page
// only make userList show users that the current user doesn't have a chat with
// try to see if you can smooth out the scrolling of your chat
// fix flaky tests that fail when ran with the otherss
