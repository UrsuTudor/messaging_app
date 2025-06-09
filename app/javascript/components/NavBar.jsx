import React from "react";

export default function NavBar({
  loggedUser,
  profileDisplay,
  setProfileDisplay,
  setUserForProfile,
  signOut,
}) {
  const isMobile = window.innerWidth < 700;

  return (
    <nav>
      {loggedUser && !profileDisplay ? (
        <div onClick={() => setProfileDisplay(true)} className="userHeader">
          <img className="bigAvatar" src={loggedUser.avatar} alt={loggedUser.name + "'s profile picture"} />
          <h4 className="userName">{loggedUser.name}</h4>
        </div>
      ) : (
        <div
          className="iconContainer"
          onClick={() => {
            setUserForProfile(null);
            setProfileDisplay(false);
          }}
        >
          <p>Home</p>
          <img className="icon" src="home.svg" alt="A home icon" />
        </div>
      )}
      <h1>Hiker's Hub</h1>
      <div className="iconContainer" onClick={signOut}>
        <p>Log Out</p>
        <img className="icon" src="log-out.svg" alt="A sign out icon" />
      </div>
    </nav>
  );
}
