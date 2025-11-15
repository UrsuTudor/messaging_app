import React, { useState } from "react";
import ChatList from "./ChatList";
import UserList from "./UserList";
import Chat from "./Chat";
import Profile from "./Profile";
import NavBar from "./NavBar";
import EventForm from "./EventForm";

export default function DesktopLayout({
  loggedUser,
  getLoggedUser,
  profile,
  setProfile,
  displayChat,
  setDisplayChat,
  receiver,
  setReceiver,
  signOut,
  chatList,
  setChatList
}) 

{
  const [dimmed, setDimmed] = useState(false)
  
  return (
    <div className={dimmed ? "appContainer dimmed" : "appContainer"}>
      <NavBar loggedUser={loggedUser} profile={profile} setProfile={setProfile} signOut={signOut} />

      <div className="mainBodyContainer">
        <ChatList
          setReceiver={setReceiver}
          setProfile={setProfile}
          chatList={chatList}
          setChatList={setChatList}
          setDimmed ={setDimmed}
          setDisplayChat={setDisplayChat}
        />

        {profile["display"] ? (
          <Profile
            loggedUser={loggedUser}
            user={profile["user"] ? profile["user"] : loggedUser}
            getLoggedUser={getLoggedUser}
          />
        ) : displayChat["chat"] ? (
          <Chat
            receiver={receiver}
            loggedUser={loggedUser}
            setProfile={setProfile}
            chatList={chatList}
            setChatList={setChatList}
            setDisplayChat={setDisplayChat}
          />
        ) : <EventForm loggedUser={loggedUser}/>}

        <UserList setReceiver={setReceiver} setProfile={setProfile} />
      </div>
    </div>
  );
}
