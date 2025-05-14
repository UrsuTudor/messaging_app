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

// Backend:
  // User model
    // associations:
      // has many ChatUsers
      // has many chats through ^
  // Message model
    // has a body and timestamp field 
    // associations:
      // belongs to chat
      // belongs to user
  // Chat model
    // facilitates relationship between Messages and User
    // associations:
      // has many ChatUsers
      // has many users through ^
      // has many messages
    // actions
      // queries for messages and sends them to frontend 
  // ChatUser table
    // references:
      // user
      // chat

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


