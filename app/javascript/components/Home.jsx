import React, { useEffect, useState } from "react";
import Profile from "./Profile";
import UserList from "./UserList";
import ChatList from "./ChatList";
import Chat from "./Chat";
import "../assets/stylesheets/home.css";
import MobileLayout from "./MobileLayout";
import NavBar from "./NavBar";

export default function Home() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [receiver, setReceiver] = useState({});
  const [profileDisplay, setProfileDisplay] = useState(false);
  const [userForProfile, setUserForProfile] = useState(null);
  const isMobile = window.innerWidth < 700;

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
    <>
      {isMobile ? (
        <MobileLayout
          loggedUser={loggedUser}
          getLoggedUser={getLoggedUser}
          userForProfile={userForProfile}
          setUserForProfile={setUserForProfile}
          receiver={receiver}
          setReceiver={setReceiver}
          profileDisplay={profileDisplay}
          setProfileDisplay={setProfileDisplay}
          signOut={signOut}
        />
      ) : (
        <div className="appContainer">
          <NavBar
            loggedUser={loggedUser}
            profileDisplay={profileDisplay}
            setProfileDisplay={setProfileDisplay}
            setUserForProfile={setUserForProfile}
            signOut={signOut}
          />

          <div className="mainBodyContainer">
            <ChatList setReceiver={setReceiver} setProfileDisplay={setProfileDisplay} />

            {profileDisplay ? (
              <Profile
                loggedUser={loggedUser}
                user={userForProfile ? userForProfile : loggedUser}
                getLoggedUser={getLoggedUser}
                setProfileDisplay={setProfileDisplay}
              />
            ) : (
              <Chat
                receiver={receiver}
                loggedUser={loggedUser}
                setProfileDisplay={setProfileDisplay}
                setUserForProfile={setUserForProfile}
              />
            )}

            <UserList
              setReceiver={setReceiver}
              setProfileDisplay={setProfileDisplay}
              setUserForProfile={setUserForProfile}
            />
          </div>
        </div>
      )}
    </>
  );
}
