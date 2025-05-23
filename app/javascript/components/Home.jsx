import React, { useEffect, useState } from "react"
import Profile from "./Profile";
import UserList from "./UserList";
import Chat from "./Chat";

export default function Home(){
  const [loggedUser, setLoggedUser] = useState(null)
  const [receiver, setReceiver] = useState({})
  const [profileDisplay, setProfileDisplay] = useState(false)

  useEffect(() => {
    getLoggedUser()
  }, [])

  async function getLoggedUser(){
    try {
      const res = await fetch('api/v1/users/current', {
        method: 'GET'
      })

      if (!res.ok) {
        throw new Error(`Your data could not be retrieved.`);
      }

      const data = await res.json()
      setLoggedUser(data)
    } catch(error){
      console.error(error.message)
    }
  }

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
      {loggedUser && <button onClick={ () => setProfileDisplay(true) }>{loggedUser.name}</button>}
      <button onClick={ signOut }>Sign out</button>
      {profileDisplay ? <Profile loggedUser = {loggedUser} user = {loggedUser} getLoggedUser={getLoggedUser} setProfileDisplay={setProfileDisplay} /> : <Chat receiver={receiver} />}
      <UserList setReceiver={setReceiver}/>
    </div>
  )
}
