import React from "react";

export default function NavBar({
  loggedUser,
  profileDisplay,
  setProfileDisplay,
  setUserForProfile,
  signOut,
}) {

  return (
    <nav>
      {loggedUser && !profileDisplay ? (
        <button onClick={() => setProfileDisplay(true)} className="userHeader" data-testid="profileBtn">
          <img className="bigAvatar" src={loggedUser.avatar} alt={loggedUser.name + "'s profile picture"} />
          <h4 className="userName">{loggedUser.name}</h4>
        </button>
      ) : (
        <button
          className="iconContainer"
          onClick={() => {
            setUserForProfile(null);
            setProfileDisplay(false);
          }}
          data-testid="homeBtn"
        >
          <p>Home</p>
          <img className="icon" src="home.svg" alt="A home icon" />
        </button>
      )}
      <h1>Hiker's Hub</h1>
      <button className="iconContainer" onClick={signOut}>
        <p>Log Out</p>
        <img className="icon" src="log-out.svg" alt="A sign out icon" />
      </button>
    </nav>
  );
}
