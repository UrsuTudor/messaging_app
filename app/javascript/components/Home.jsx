import React from "react"
import UserList from "./UserList";

export default function Home(){
  async function signOut(){
    const res = await fetch("/users/sign_out", {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
      },
    })

    if (res.ok) {
    // Redirect to the sign-in page or root path
    window.location.href = "/users/sign_in"; // or "/"
    } else {
      console.error("Failed to sign out.");
    }
  }

  return (
    <div>
      <h1>Hi</h1>
      <UserList />
      <button onClick={signOut}>Sign out</button>
    </div>
  )
}
