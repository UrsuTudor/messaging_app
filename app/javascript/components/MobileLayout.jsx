import React, { useState } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import Profile from "./Profile";
import NavBar from "./NavBar";
import EventList from "./EventList";
import Event from "./Event";
import EventForm from "./EventForm";
import InviteList from "./InviteList";

export default function MobileLayout({
  loggedUser,
  getLoggedUser,
  signOut,
  chatList,
  setChatList,
  mainDisplay,
  setMainDisplay,
}) {
  const [dimmed, setDimmed] = useState(false);

  return (
    <div className={dimmed ? "appContainer dimmed" : "appContainer"}>
      <NavBar
        loggedUser={loggedUser}
        setMainDisplay={setMainDisplay}
        signOut={signOut}
        setDimmed={setDimmed}
      />

      {mainDisplay.at(-1)?.type == "chatList" && (
        <ChatList
          mainDisplay={mainDisplay}
          setMainDisplay={setMainDisplay}
          chatList={chatList}
          setChatList={setChatList}
          setDimmed={setDimmed}
        />
      )}

      {mainDisplay.at(-1)?.type == "profile" && (
        <Profile
          loggedUser={loggedUser}
          user={mainDisplay.at(-1).user ? mainDisplay.at(-1).user : loggedUser}
          getLoggedUser={getLoggedUser}
          setMainDisplay={setMainDisplay}
        />
      )}

      {mainDisplay.at(-1)?.type == "chat" && (
        <Chat
          setMainDisplay={setMainDisplay}
          receivers={mainDisplay.at(-1).receivers}
          loggedUser={loggedUser}
          chatList={chatList}
          setChatList={setChatList}
          setDimmed={setDimmed}
        />
      )}

      {mainDisplay.at(-1)?.type == "event" && (
        <Event
          setMainDisplay={setMainDisplay}
          event={mainDisplay.at(-1).event}
          loggedUser={loggedUser}
          getLoggedUser={getLoggedUser}
          setDimmed={setDimmed}
        />
      )}

      {mainDisplay.at(-1)?.type == "eventForm" && (
        <EventForm
          setMainDisplay={setMainDisplay}
          loggedUser={loggedUser}
          getLoggedUser={getLoggedUser}
          setDimmed={setDimmed}
          event={mainDisplay.at(-1).event}
          action={mainDisplay.at(-1).action}
        />
      )}

      {mainDisplay.at(-1)?.type == "inviteList" && (
        <InviteList eventIds={mainDisplay.at(-1).eventIds} setMainDisplay={setMainDisplay} />
      )}

      {!mainDisplay[0] && <EventList setMainDisplay={setMainDisplay} />}
    </div>
  );
}
