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

// Frontend:
  // Home component
    // displays a placeholder chat on load
  // Chat component
    // displays a loading state until the fetch is done

    // add a way to see the profiles of other users
