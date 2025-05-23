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
    // displays Profile, UserList on the side and opened chats 
    // displays a placeholder chat on load
  // Chat component
    // displays a loading state until the fetch is done
  // ChatList component
    // shows a list of chats the current user already has

    // your create method in messages_controller is still exposing user ids, make sure you fix that
    // ensure the current_user isn't being returned by your users_controller index
    // limit the amount of users and messages returned by your index methods for userslist, chatlist and chats
