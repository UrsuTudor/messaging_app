import React, { useEffect, useState } from "react";
import Profile from "./Profile";
import UserList from "./UserList";
import ChatList from "./ChatList";
import Chat from "./Chat";
import "../assets/stylesheets/home.css"

export default function Home() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [receiver, setReceiver] = useState({});
  const [profileDisplay, setProfileDisplay] = useState(false);

  useEffect(() => {
    getLoggedUser();
  }, []);

  async function getLoggedUser() {
    try {
      const res = await fetch("api/v1/users/current", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Your data could not be retrieved.`);
      }

      const data = await res.json();
      setLoggedUser(data);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function signOut() {
    const res = await fetch("/users/sign_out", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
      },
    });

    if (res.ok) {
      window.location.href = "/users/sign_in";
    } else {
      console.error("Failed to sign out.");
    }
  }

  return (
    <div className="appContainer" >
      <nav>
        { loggedUser && !profileDisplay ? (
          <div onClick={() => setProfileDisplay(true)} className="userHeader">
            <img className="bigAvatar" src={loggedUser.avatar} alt={loggedUser.name + "'s profile picture"} />
            <h4 className="userName">
              {loggedUser.name}
            </h4>
          </div>
        ) : (
          <div className="iconContainer" onClick={() => setProfileDisplay(false)}>
            <p>Home</p>
            <img className="icon" src="home.svg" alt="A home icon"/>
          </div>
        )}
        <div className="iconContainer" onClick={signOut}>
          <p>Log Out</p>
          <img className="icon" src="log-out.svg" alt="A sign out icon"/>
        </div>
      </nav>

      <div className="mainBodyContainer">
        <ChatList setReceiver={setReceiver} />

        {profileDisplay ? (
          <Profile
            loggedUser={loggedUser}
            user={loggedUser}
            getLoggedUser={getLoggedUser}
            setProfileDisplay={setProfileDisplay}
          />
        ) : (
          <Chat receiver={receiver} loggedUser={loggedUser}/>
        )}

        <UserList setReceiver={setReceiver} />
      </div>
    </div>
  );
}
