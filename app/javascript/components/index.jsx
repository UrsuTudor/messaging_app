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
// fix chatlist fetch method doubling elements
// do mobile/tablet designs
// write frontend tests and update backend tests to test pagy
// update chat list when a message is sent to a new chat
