import React, { useEffect, useState } from "react";
import EventBanner from "./EventBanner";
import "../assets/stylesheets/inviteList.css";

export default function InviteList({ eventIds, setMainDisplay }) {
  const [eventsInvitedTo, setEventsInvitedTo] = useState([]);
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        eventIds.map(async (e) => {
          const res = await fetch(`/api/v1/events/${e}`);

          if (!res.ok) {
            throw new Error(`We couldn't retrieve the event details.`);
          }

          return res.json();
        }),
      );

      setEventsInvitedTo(results);
    }

    load();
  }, [eventIds]);

  async function replyToInvite(reply, eventId) {
    try {
      const res = await fetch(`/api/v1/events/update_membership`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_membership: { event_id: eventId, reply: reply },
        }),
      });

      if (!res.ok) {
        throw new Error("Invite status could not be updated.");
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="inviteList">
      <div className="inviteListHeader">
        <div
          className="chatIconContainer"
          onClick={() => {
            setMainDisplay((prev) => prev.slice(0, -1));
          }}
          data-testid="chatBackArrow"
        >
          <img className="icon homeBtn" src="arrow-left.svg" />
        </div>
        <p>You have been invited to join the following events:</p>
      </div>
      <div className="listContainer">
        {eventsInvitedTo.map((e) => {
          return (
            <div className="inviteContainer">
              <EventBanner key={e.id} event={e} setMainDisplay={setMainDisplay} hereFrom={"home"} />
              <div className="inviteBtnsContainer">
                <button
                  className="iconContainer profileIconContainer"
                  onClick={() => replyToInvite("accepted", e.id)}
                >
                  Accept
                </button>
                <button
                  className="iconContainer profileIconContainer"
                  onClick={() => replyToInvite("declined", e.id)}
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
