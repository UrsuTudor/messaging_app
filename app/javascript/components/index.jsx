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
  // make clicking chat or a user open a chat even if the user is on the profile page (probably as easy as giving the 
  // profileDisplay setter to them as a prop)
  // fail updating of profile picture if no picture was uploaded
