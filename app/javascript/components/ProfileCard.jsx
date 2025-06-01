import React from "react";
import "../assets/stylesheets/profileCard"

export default function ProfileCard({user}){
  return (
    <div className="cardContainer">
      <img className="smallAvatar" src={user.avatar} alt={user.name + "'s profile picture"} />
      <h4 className="userName">{user.name}</h4>
      <p>{user.description}</p>
    </div>
  )
}
