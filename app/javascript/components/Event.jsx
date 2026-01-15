import React, { useState } from "react";
import { createPortal } from "react-dom";
import SearchBar from "./SearchBar";
import UserListForm from "./UserListForm";
import { sendOrganiserInvites } from "../assets/helpers";
import "../assets/stylesheets/event.css";

export default function Event({
  event,
  setMainDisplay,
  loggedUser,
  getLoggedUser,
  setDimmed,
}) {
  const [eventDetails, setEventDetails] = useState(event);
  const [displayUserListForm, setDisplayUserListForm] = useState(false);
  const [displayParticipantList, setDisplayParticipantList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState(null);
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
    if (event.organisers.length == 1) {
      setFeedback(
        "You are the only organiser of this event. Please use the 'Delete' button if you wish to delete the event."
      );
      return;
    }

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
      setMainDisplay((prev) => [...prev.slice(0, -1)])
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
            setMainDisplay((prev) => [...prev.slice(0, -1)])
          }}
          data-testid="chatBackArrow"
        >
          <img className="icon" src="arrow-left.svg" />
        </div>
        <h1></h1>
      </div>

      <div className="scrollable">
        <div className="eventCoverContainer">
          <img
            className="eventCover"
            src={event.cover_image_url ? event.cover_image_url : "forest.jpg"}
            alt=""
          />
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
                    setMainDisplay((prev) => [...prev, {type: "profile", user: org}])
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
                  onClick={() => setDisplayUserListForm(true)}
                >
                  Invite other organisers
                </button>
                <button
                  className="iconContainer profileIconContainer"
                  type="button"
                  onClick={() => {
                    setMainDisplay((prev) => [...prev.slice(0, -1), {type: "eventForm", event: event, action: "update"}])
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

          {feedback && (
            <p className="feedbackMsg" data-testid={"feedback"}>
              {feedback}
            </p>
          )}

          <p className="eventDescription">{event.description}</p>

          <div className="participantContainer">
            <h3>Participants:</h3>
            {eventDetails.participants.slice(0, 3).map((part) => (
              <img
                key={part[0].uuid}
                className="smallAvatar"
                src={part[0].avatar ? part[0].avatar : "user_dark.svg"}
                alt={part[0].name + "'s profile picture"}
                onClick={() => {
                  setMainDisplay((prev) => [...prev, {type: "profile", user: part}])
                }}
              />
            ))}
            {eventDetails.participants.length > 4 && <p>...and {event.participants.length} others!</p>}
            <button
              className="iconContainer profileIconContainer"
              type="button"
              onClick={() => {
                setDimmed(true);
                setDisplayParticipantList(true);
              }}
            >
              See Full List
            </button>

            {displayParticipantList &&
              createPortal(
                <div className="groupForm">
                  <div className="listHeader">
                    <SearchBar adaptable={false} setSearchTerm={setSearchTerm} />
                    <img
                      className="chatIconContainer edgeBtn"
                      src="xmark.svg"
                      alt="Close group form"
                      onClick={() => {
                        setDisplayParticipantList(false);
                        setDimmed(false);
                      }}
                    />
                  </div>
                  {eventDetails.participants
                    .filter((part) => part[0].name.includes(searchTerm))
                    .map((part) => (
                      <button
                        type="button"
                        key={part[0].uuid}
                        className="userContainer"
                        onClick={() => {
                          setDimmed(false);
                          setMainDisplay((prev) => [...prev, {type: "profile", user: part}])
                        }}
                        data-testid="groupFormUserBtn"
                      >
                        <div className="userHeader">
                          <img
                            className="smallAvatar"
                            src={part[0].avatar ? part[0].avatar : "user_dark.svg"}
                            alt={part[0].name + "'s profile picture"}
                          />
                          <h4 className="userName">{part[0].name}</h4>
                        </div>
                      </button>
                    ))}
                </div>,
                document.body
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
