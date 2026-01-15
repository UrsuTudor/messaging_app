import React, { useState } from "react";
import InviteList from "./InviteList";
import UserList from "./UserList";

export default function NavBar({
  loggedUser,
  setMainDisplay,
  signOut,
}) {
  const [displayInviteList, setDisplayInviteList] = useState(false);
  const pendingRequests = loggedUser[0].pending_requests;

  return (
    <nav>
      <button className="iconContainer homeBtn" onClick={() => setMainDisplay([])}>
        <img className="icon" src="home.svg" alt="a home icon" />
      </button>
      <button onClick={() => setMainDisplay((prev) => [...prev, {type: "profile"}])} className="userHeader" data-testid="profileBtn">
        <img
          className="bigAvatar"
          src={loggedUser[0].avatar ? loggedUser[0].avatar : "user.svg"}
          alt={loggedUser[0].name + "'s profile picture"}
        />
        <h4 className="userName">{loggedUser[0].name}</h4>
      </button>

      <UserList setMainDisplay={setMainDisplay} />

      <h1>Hiker's Hub</h1>
      <button
        className="iconContainer"
        onClick={() => {
          setDisplayInviteList(true);
        }}
      >
        <img className="icon" src="trekking.svg" alt="View your invites" />
        <p>{pendingRequests.length}</p>
      </button>
      <button className="iconContainer" onClick={signOut}>
        <p>Log Out</p>
        <img className="icon" src="log-out.svg" alt="A sign out icon" />
      </button>

      {displayInviteList && <InviteList eventIds={pendingRequests} setMainDisplay={setMainDisplay}/>}
    </nav>
  );
}
