import React, { useState } from "react"
import UserList from "./UserList";
import Chat from "./Chat";

export default function Home(){
  const [receiver, setReceiver] = useState({})
  const [profileDisplay, setProfileDisplay] = useState(false)

  async function signOut(){
    const res = await fetch("/users/sign_out", {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
      },
    })

    if (res.ok) {
      window.location.href = "/users/sign_in";
    } else {
      console.error("Failed to sign out.");
    }
  }

  return (
    <div>
      <button onClick={signOut}>Sign out</button>
      {profileDisplay ? <Profile /> : <Chat receiver={receiver} />}
      <UserList setReceiver={setReceiver}/>
    </div>
  )
}
