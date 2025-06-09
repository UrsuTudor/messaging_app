import React, { createContext, useState } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import Profile from "./Profile";
import UserList from "./UserList";
import NavBar from "./NavBar";

export default function MobileLayout({
  loggedUser,
  getLoggedUser,
  userForProfile,
  setUserForProfile,
  receiver,
  setReceiver,
  profileDisplay,
  setProfileDisplay,
  signOut,
}) {
  const [displayChatList, setDisplayChatList] = useState(true);
  const [displayChat, setDisplayChat] = useState(false);

  return (
    <div className="appContainer">
      <NavBar
        loggedUser={loggedUser}
        profileDisplay={profileDisplay}
        setProfileDisplay={setProfileDisplay}
        setUserForProfile={setUserForProfile}
        signOut={signOut}
      />

      <div className="mainBodyContainer">
        {displayChatList && !profileDisplay && (
          <ChatList
            setReceiver={setReceiver}
            setProfileDisplay={setProfileDisplay}
            setDisplayChat={setDisplayChat}
            setDisplayChatList={setDisplayChatList}
            setUserForProfile={setUserForProfile}
          />
        )}

        {profileDisplay && (
          <Profile
            loggedUser={loggedUser}
            user={userForProfile ? userForProfile : loggedUser}
            getLoggedUser={getLoggedUser}
            setProfileDisplay={setProfileDisplay}
          />
        )}

        {displayChat && (
          <Chat
            receiver={receiver}
            loggedUser={loggedUser}
            setProfileDisplay={setProfileDisplay}
            setUserForProfile={setUserForProfile}
            setDisplayChat={setDisplayChat}
            setDisplayChatList={setDisplayChatList}
          />
        )}
      </div>
    </div>
  );
}
