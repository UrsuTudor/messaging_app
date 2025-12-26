import React, { useState } from "react";
import ChatList from "./ChatList";
import UserList from "./UserList";
import Chat from "./Chat";
import Profile from "./Profile";
import NavBar from "./NavBar";
import EventForm from "./EventForm";
import Event from "./Event";
import EventList from "./EventList";

export default function DesktopLayout({
  loggedUser,
  getLoggedUser,
  profile,
  setProfile,
  displayChat,
  setDisplayChat,
  displayEvent,
  setDisplayEvent,
  receiver,
  setReceiver,
  signOut,
  chatList,
  setChatList,
  displayEventForm,
  setDisplayEventForm,
}) {
  const [dimmed, setDimmed] = useState(false);

  return (
    <div className={dimmed ? "appContainer dimmed" : "appContainer"}>
      <NavBar
        loggedUser={loggedUser}
        profile={profile}
        setProfile={setProfile}
        signOut={signOut}
        setDisplayEvent={setDisplayEvent}
      />

      <div className="mainBodyContainer">
        <ChatList
          setReceiver={setReceiver}
          setProfile={setProfile}
          chatList={chatList}
          setChatList={setChatList}
          setDimmed={setDimmed}
          setDisplayChat={setDisplayChat}
        />

        {profile["display"] ? (
          <Profile
            loggedUser={loggedUser}
            user={profile["user"] ? profile["user"] : loggedUser}
            getLoggedUser={getLoggedUser}
            setDisplayEvent={setDisplayEvent}
            setProfile={setProfile}
            hereFrom={profile["hereFrom"]}
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
        ) : displayEvent["display"] ? (
          <Event
            event={displayEvent["event"]}
            setProfile={setProfile}
            setDisplayEvent={setDisplayEvent}
            hereFrom={displayEvent.from}
            loggedUser={loggedUser}
            getLoggedUser={getLoggedUser}
            setDisplayEventForm={setDisplayEventForm}
            setDimmed={setDimmed}
          />
        ) : displayEventForm["display"] ? (
          <EventForm
            loggedUser={loggedUser}
            setDisplayEventForm={setDisplayEventForm}
            getLoggedUser={getLoggedUser}
            setDimmed={setDimmed}
            event={displayEventForm["event"]}
            action={displayEventForm["action"]}
          />
        ) : (
          <EventList
            setDisplayEvent={setDisplayEvent}
            setProfile={setProfile}
            setDisplayEventForm={setDisplayEventForm}
          />
        )}

        <UserList setReceiver={setReceiver} setProfile={setProfile} />
      </div>
    </div>
  );
}
