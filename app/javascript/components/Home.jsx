import React, { useEffect, useState } from "react";
import "../assets/stylesheets/home.css";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export default function Home() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [receiver, setReceiver] = useState([]);
  const [profile, setProfile] = useState({ display: false, user: null });
  const [displayChat, setDisplayChat] = useState({ chat: false, chatList: true });
  const [chatList, setChatList] = useState([]);
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
      setLoggedUser([data]);
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
      {!loggedUser ? (<div>Loading...</div>) : isMobile ? (
        <MobileLayout
          loggedUser={loggedUser}
          getLoggedUser={getLoggedUser}
          profile={profile}
          setProfile={setProfile}
          receiver={receiver}
          setReceiver={setReceiver}
          signOut={signOut}
          chatList={chatList}
          setChatList={setChatList}
        />
      ) : (
        <DesktopLayout
          loggedUser={loggedUser}
          getLoggedUser={getLoggedUser}
          profile={profile}
          setProfile={setProfile}
          displayChat={displayChat}
          setDisplayChat={setDisplayChat}
          receiver={receiver}
          setReceiver={setReceiver}
          signOut={signOut}
          chatList={chatList}
          setChatList={setChatList}
        />
      )}
    </>
  );
}
