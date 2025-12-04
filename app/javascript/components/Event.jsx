import React, { useState, useEffect } from "react";

export default function Event({ event, setProfile, setDisplayEvent, hereFrom, loggedUser, getLoggedUser }) {
  const [eventDetails, setEventDetails] = useState(event);
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  async function joinEvent() {
    try {
      const res = await fetch(`/api/v1/events/participate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ event_membership: { event_id: event.id, role: "participant" } }),
      });

      if (!res.ok) {
        throw new Error("Atempt to join the event failed.");
      }

      setEventDetails((prev) => ({ ...prev, participants: [...prev.participants, loggedUser[0]] }));
    } catch (error) {
      console.error(error.message);
    }
  }

  async function leaveEvent() {
    try {
      const res = await fetch(`/api/v1/events/leave_event`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ event_membership: { event_id: event.id } }),
      });

      if (!res.ok) {
        throw new Error("Failed to leave the event.");
      }

      if (eventDetails.organisers.map((org) => org.uuid).includes(loggedUser.uuid)) {
        setEventDetails((prev) => ({
          ...prev,
          organisers: prev.organisers.filter((org) => org.uuid != loggedUser[0].uuid),
        }));
      } else {
        setEventDetails((prev) => ({
          ...prev,
          participants: prev.participants.filter((part) => part.uuid != loggedUser[0].uuid),
        }));
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  async function deleteEvent() {
    try {
      const res = await fetch(`/api/v1/events/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ event: { id: event.id } }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete the event.");
      }

      getLoggedUser()
      setDisplayEvent({ display: false, event: null });
      hereFrom == "profile"
        ? setProfile((prev) => ({ ...prev, display: true }))
        : setDisplayEvent((prev) => ({ ...prev, display: false }));

    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="eventContainer">
      <button
        onClick={() => {
          setDisplayEvent({ display: false, event: null });
          hereFrom == "profile"
            ? setProfile((prev) => ({ ...prev, display: true }))
            : setDisplayEvent((prev) => ({ ...prev, display: false }));
        }}
      >
        Back
      </button>
      <div>
        <img src={event.cover_image_url} alt="" />
        <div className="orgContainer">
          {event.organisers.map((org) => (
            <img
              key={org.uuid}
              className="smallAvatar"
              src={org.avatar ? org.avatar : "user_dark.svg"}
              alt={org.name + "'s profile picture"}
              onClick={() => {
                setDisplayEvent((prev) => ({ display: false, event: null }));
                setProfile((prev) => ({ display: true, user: [org] }));
              }}
            />
          ))}
        </div>
        <h2>{event.title}</h2>
        <p>{event.date}</p>
        <p>{event.location}</p>
        {[
          ...eventDetails.participants.map((part) => part.uuid),
          ...eventDetails.organisers.map((org) => org.uuid),
        ].includes(loggedUser[0].uuid) ? (
          <button onClick={() => leaveEvent()}>Leave Event</button>
        ) : (
          <button onClick={() => joinEvent()}>Join Event</button>
        )}
        {event.organisers.length == 1 && <button onClick={() => deleteEvent()}>Delete Event</button>}
        <p>{event.description}</p>

        {eventDetails.participants.map((part) => (
          <img
            key={part.uuid}
            className="smallAvatar"
            src={part.avatar ? org.avatar : "user_dark.svg"}
            alt={part.name + "'s profile picture"}
            onClick={() => {
              setDisplayEvent((prev) => ({ display: false, event: null }));
              setProfile((prev) => ({ display: true, user: [part] }));
            }}
          />
        ))}
      </div>
    </div>
  );
}
