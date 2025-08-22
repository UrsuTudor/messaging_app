import React from "react";
import ChatList from "./ChatList";
import UserList from "./UserList";
import Chat from "./Chat";
import Profile from "./Profile";
import NavBar from "./NavBar";

export default function DesktopLayout({
  loggedUser,
  getLoggedUser,
  profile,
  setProfile,
  receiver,
  setReceiver,
  signOut,
  refetchChatList,
  setRefetchChatList,
}) {
  return (
    <div className="appContainer">
      <NavBar loggedUser={loggedUser} profile={profile} setProfile={setProfile} signOut={signOut} />

      <div className="mainBodyContainer">
        <ChatList
          setReceiver={setReceiver}
          setProfile={setProfile}
          refetchChatList={refetchChatList}
          setRefetchChatList={setRefetchChatList}
        />

        {profile["display"] ? (
          <Profile
            loggedUser={loggedUser}
            user={profile["user"] ? profile["user"] : loggedUser}
            getLoggedUser={getLoggedUser}
          />
        ) : (
          <Chat
            receiver={receiver}
            loggedUser={loggedUser}
            setProfile={setProfile}
            setRefetchChatList={setRefetchChatList}
          />
        )}

        <UserList setReceiver={setReceiver} setProfile={setProfile} />
      </div>
    </div>
  );
}
