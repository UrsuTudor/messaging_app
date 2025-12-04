import React, { useEffect, useState } from "react";
import EventBanner from "./EventBanner";
import "../assets/stylesheets/inviteList.css";

export default function InviteList({ eventIds, setDisplayEvent }) {
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
        })
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
      {eventsInvitedTo.map((e) => {
        return (
          <div className="inviteContainer">
            <EventBanner key={e.id} event={e} setDisplayEvent={setDisplayEvent} hereFrom={"home"} />;
            <div className="inviteMsg">
              <p>You have been invited to become an organiser of this event.</p>
              <button onClick={() => replyToInvite("accepted", e.id)}>Accept</button>
              <button onClick={() => replyToInvite("declined", e.id)}>Decline</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
