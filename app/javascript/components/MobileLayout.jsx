import React, { useState } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import Profile from "./Profile";
import NavBar from "./NavBar";

export default function MobileLayout({
  loggedUser,
  getLoggedUser,
  receiver,
  setReceiver,
  signOut,
  profile,
  setProfile,
  chatList,
  setChatList
}) {
  const [dimmed, setDimmed] = useState(false)

  return (
    <div className={dimmed ? "appContainer dimmed" : "appContainer"}>
      <NavBar loggedUser={loggedUser} profile={profile} setProfile={setProfile} signOut={signOut} />

      <div className="mainBodyContainer">
        {displayChat["chatList"] && !profile["display"] && (
          <ChatList
            setReceiver={setReceiver}
            setProfile={setProfile}
            setDisplayChat={setDisplayChat}
            chatList={chatList}
            setChatList={setChatList}
            setDimmed ={setDimmed}
          />
        )}

        {profile["display"] && (
          <Profile
            loggedUser={loggedUser}
            user={profile["user"] ? profile["user"] : loggedUser}
            getLoggedUser={getLoggedUser}
          />
        )}

        {displayChat["chat"] && (
          <Chat
            receiver={receiver}
            loggedUser={loggedUser}
            setProfile={setProfile}
            setDisplayChat={setDisplayChat}
          />
        )}
      </div>
    </div>
  );
}
