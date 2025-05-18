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
    // parent
    // displays Profile, UserList on the side and opened chats 
    // displays a placeholder chat on load
  // Profile component
    // fetches user data, such as username, profile picture, user description
  // Chat component
    // gets user uuids from home
    // fetches messages and displays them
    // displays a loading state until the fetch is done
  // UserList component
    // fetches user data, such as username, profile picture, UUIDs 
    // displays a list of users
    // has a chat state
    // when a user is clicked, update state with new uuid and fetch the new chat to display it
  // ChatList component
    // shows a list of chats the current user already has
