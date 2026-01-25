import React, { useState } from "react";
import InviteList from "./InviteList";
import UserList from "./UserList";

export default function NavBar({ loggedUser, setMainDisplay, signOut, setDimmed }) {
  const [displayInviteList, setDisplayInviteList] = useState(false);
  const isMobile = window.innerWidth < 700;
  const pendingRequests = loggedUser[0].pending_requests;

  return (
    <nav>
      <div className="navContainer">
        {!isMobile && (
          <button className="iconContainer homeBtn" onClick={() => setMainDisplay([])}>
            <img className="icon" src="home.svg" alt="a home icon" />
          </button>
        )}
        <button
          onClick={() => setMainDisplay((prev) => [...prev, { type: "profile" }])}
          className="userHeader"
          data-testid="profileBtn"
        >
          <img
            className="bigAvatar"
            src={loggedUser[0].avatar ? loggedUser[0].avatar : "user.svg"}
            alt={loggedUser[0].name + "'s profile picture"}
          />
          <h4 className="userName">{loggedUser[0].name}</h4>
        </button>

        {!isMobile && <UserList setMainDisplay={setMainDisplay} />}

        <h1>Hiker's Hub</h1>
        {!isMobile && (
          <button
            className="iconContainer"
            onClick={() => {
              setDisplayInviteList(!displayInviteList);
            }}
          >
            <img className="icon" src="trekking.svg" alt="View your invites" />
            <p>{pendingRequests.length}</p>
          </button>
        )}
        <button className="iconContainer" onClick={signOut}>
          <p>Log Out</p>
          <img className="icon" src="log-out.svg" alt="A sign out icon" />
        </button>
      </div>

      {isMobile && (
        <div className="navBtnsContainer">
          <button className="iconContainer homeBtn" onClick={() => setMainDisplay([])}>
            <img className="icon" src="home.svg" alt="a home icon" />
          </button>

          <button className="iconContainer homeBtn" onClick={() => setMainDisplay((prev) => [...prev, {type: "chatList"}])}>
            <img className="icon" src="chat-bubble.svg" alt="a home icon" />
          </button>

          <UserList setMainDisplay={setMainDisplay} setDimmed={setDimmed} />

          <button
            className="iconContainer homeBtn"
            onClick={() => {
              setMainDisplay((prev) => [...prev, {type: "inviteList", eventIds: pendingRequests}])
            }}
          >
            <img className="icon" src="trekking.svg" alt="View your invites" />
            <p>{pendingRequests.length}</p>
          </button>
        </div>
      )}

      {displayInviteList && !isMobile && <InviteList eventIds={pendingRequests} setMainDisplay={setMainDisplay} />}
    </nav>
  );
}
