import React from "react";

export default function Event({ event, setProfile, setDisplayEvent }) {
  return (
    <div>
      <button
        onClick={() => {
          setDisplayEvent((prev) => ({display: false, event: null}))
          setProfile((prev) => ({ ...prev, display: true }));
        }}
      >
        Back
      </button>
      <div className="eventContainer">
        <img src={event.cover_image_url} alt="" />
        <div className="orgContainer">
          {event.organisers.map((org) => (
            <img
              className="smallAvatar"
              src={org.avatar ? org.avatar : "user_dark.svg"}
              alt={org.name + "'s profile picture"}
              onClick={() => {
                setDisplayEvent((prev) => ({display: false, event: null}))
                setProfile((prev) => ({ display: true, user: [org] }))
              }}
            />
          ))}
        </div>
        <h2>{event.title}</h2>
        <p>{event.date}</p>
        <p>{event.location}</p>
        <p>{event.description}</p>
      </div>
    </div>
  );
}
