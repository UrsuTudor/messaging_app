import React, { useState } from "react";
import InviteList from "./InviteList";

export default function NavBar({
  loggedUser,
  profile,
  setProfile,
  signOut,
  setDisplayEvent
}) {
  const [displayInviteList, setDisplayInviteList] = useState(false)
  const pendingRequests = loggedUser[0].pending_requests

  return (
    <nav>
      {loggedUser && !profile["display"] ? (
        <button onClick={() => setProfile({display: true})} className="userHeader" data-testid="profileBtn">
          <img className="bigAvatar" src={loggedUser[0].avatar ? loggedUser[0].avatar : "user.svg"} alt={loggedUser[0].name + "'s profile picture"} />
          <h4 className="userName">{loggedUser[0].name}</h4>
        </button>
      ) : (
        <button
          className="iconContainer"
          onClick={() => {
            setProfile({display: false, user: null})
          }}
          data-testid="homeBtn"
        >
          <p>Home</p>
          <img className="icon" src="home.svg" alt="A home icon" />
        </button>
      )}
      <h1>Hiker's Hub</h1>
      <button className="iconContainer" onClick={() => {setDisplayInviteList(true)}}>
        <img className="icon" src="trekking.svg" alt="View your invites" />
        <p>{pendingRequests.length}</p>
      </button>
      <button className="iconContainer" onClick={signOut}>
        <p>Log Out</p>
        <img className="icon" src="log-out.svg" alt="A sign out icon" />
      </button>

      {displayInviteList && <InviteList eventIds={pendingRequests} setDisplayEvent={setDisplayEvent}/>}
    </nav>
  );
}
