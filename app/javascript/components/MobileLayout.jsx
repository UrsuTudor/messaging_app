import React, { createContext, useState } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import Profile from "./Profile";
import UserList from "./UserList";
import NavBar from "./NavBar";

export default function MobileLayout({
  loggedUser,
  getLoggedUser,
  receiver,
  setReceiver,
  signOut,
  refetchChatList,
  setRefetchChatList,
  profile,
  setProfile
}) {
  const [displayChat, setDisplayChat] = useState({chat: false, chatList: true});

  return (
    <div className="appContainer">
      <NavBar
        loggedUser={loggedUser}
        profile={profile}
        setProfile={setProfile}
        signOut={signOut}
      />

      <div className="mainBodyContainer">
        {displayChat["chatList"] && !profile["display"] && (
          <ChatList
            setReceiver={setReceiver}
            setProfile={setProfile}
            setDisplayChat={setDisplayChat}
            refetchChatList={refetchChatList}
            setRefetchChatList={setRefetchChatList}
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
            setRefetchChatList={setRefetchChatList}
          />
        )}
      </div>
    </div>
  );
}
