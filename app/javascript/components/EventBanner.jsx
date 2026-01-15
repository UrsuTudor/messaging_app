import React from "react";
import "../assets/stylesheets/eventBanner.css";

export default function EventBanner({ setMainDisplay, event, hereFrom }) {
  async function displayEvent() {
    try {
      const res = await fetch(`/api/v1/events/${event.id}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`We couldn't retrieve the event details.`);
      }

      const data = await res.json();
      setMainDisplay((prev) => [...prev, {type: "event", event: data}])
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="eventBanner" onClick={() => displayEvent()}>
      <img src={event.cover_image_url ? event.cover_image_url : "forest.jpg"} alt="Event cover image" />
      <div className="bannerText">
        <h2>{event.title}</h2>
        <p className="eventDate">{event.date}</p>
        <p>{event.location}</p>
      </div>
    </div>
  );
}
