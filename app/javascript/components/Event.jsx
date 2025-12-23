import React, { useState } from "react";
import UserListForm from "./UserListForm";
import { updateEventDetails } from "../assets/helpers";
import { sendOrganiserInvites } from "../assets/helpers";
import "../assets/stylesheets/event.css";

export default function Event({
  event,
  setProfile,
  setDisplayEvent,
  setDisplayEventForm,
  hereFrom,
  loggedUser,
  getLoggedUser,
  setDimmed,
}) {
  const [eventDetails, setEventDetails] = useState(event);
  const [displayUserListForm, setDisplayUserListForm] = useState(false);
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

      setEventDetails((prev) => ({ ...prev, participants: [...prev.participants, loggedUser] }));

      getLoggedUser();
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

      if (eventDetails.organisers.map((org) => org[0].uuid).includes(loggedUser[0].uuid)) {
        setEventDetails((prev) => ({
          ...prev,
          organisers: prev.organisers.filter((org) => org[0].uuid != loggedUser[0].uuid),
        }));
      } else {
        setEventDetails((prev) => ({
          ...prev,
          participants: prev.participants.filter((part) => part[0].uuid != loggedUser[0].uuid),
        }));
      }

      getLoggedUser();
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

      getLoggedUser();
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
      <div className="listHeader">
        <div
          className="chatIconContainer"
          onClick={() => {
            setDisplayEvent({ display: false, event: null });
            hereFrom == "profile"
              ? setProfile((prev) => ({ ...prev, display: true }))
              : setDisplayEvent((prev) => ({ ...prev, display: false }));
          }}
          data-testid="chatBackArrow"
        >
          <img className="icon" src="arrow-left.svg" />
        </div>
        <h1></h1>
      </div>

      <div className="scrollable">
        <div className="eventCoverContainer">
          <img className="eventCover" src={event.cover_image_url} alt="" />
        </div>

        <div className="eventDetailsContainer">
          <div className="eventHeader">
            <h2>{event.title}</h2>

            <p>{event.date}</p>
            <p>{event.location}</p>
            <div className="orgContainer">
              <h3>Organised by:</h3>
              {eventDetails.organisers.map((org) => (
                <img
                  key={org[0].uuid}
                  className="smallAvatar"
                  src={org[0].avatar ? org[0].avatar : "user_dark.svg"}
                  alt={org[0].name + "'s profile picture"}
                  onClick={() => {
                    setDisplayEvent({ display: false, event: null });
                    setProfile({ display: true, user: org });
                  }}
                />
              ))}
            </div>
          </div>

          <div className="eventBtnsContainer">
            {eventDetails.organisers.map((org) => org[0].uuid).includes(loggedUser[0].uuid) && (
              <div className="organiserBtnsContainer">
                <button
                  className="iconContainer profileIconContainer"
                  type="button"
                  onClick={() => {
                    setDimmed(true);
                    setDisplayUserListForm(true);
                  }}
                >
                  Invite other organisers
                </button>
                <button
                  className="iconContainer profileIconContainer"
                  type="button"
                  onClick={() => {
                    setDisplayEventForm({ display: true, event: event, action: "update" });
                    setDisplayEvent((prev) => ({ ...prev, display: false }));
                  }}
                >
                  Change Event Details
                </button>
                {event.organisers.length == 1 &&
                  eventDetails.organisers.map((org) => org[0].uuid).includes(loggedUser[0].uuid) && (
                    <button
                      className="iconContainer profileIconContainer deletionBtn"
                      onClick={() => deleteEvent()}
                    >
                      Delete Event
                    </button>
                  )}
                {displayUserListForm && (
                  <UserListForm
                    setDimmed={setDimmed}
                    setDisplayUserListForm={setDisplayUserListForm}
                    callback={sendOrganiserInvites}
                    args={[event.id, csrfToken]}
                  />
                )}
              </div>
            )}

            {[
              ...eventDetails.participants.map((part) => part[0].uuid),
              ...eventDetails.organisers.map((org) => org[0].uuid),
            ].includes(loggedUser[0].uuid) ? (
              <button className="iconContainer profileIconContainer deletionBtn" onClick={() => leaveEvent()}>
                Leave Event
              </button>
            ) : (
              <button className="iconContainer profileIconContainer" onClick={() => joinEvent()}>
                Join Event
              </button>
            )}
          </div>

          <p className="eventDescription">{event.description}</p>

          {eventDetails.participants.map((part) => (
            <img
              key={part[0].uuid}
              className="smallAvatar"
              src={part[0].avatar ? part[0].avatar : "user_dark.svg"}
              alt={part[0].name + "'s profile picture"}
              onClick={() => {
                setDisplayEvent({ display: false, event: null });
                setProfile({ display: true, user: part });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
