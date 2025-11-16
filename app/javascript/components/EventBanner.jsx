import React from "react";

export default function EventBanner({ event, setDisplayEvent, setProfile }) {
  async function displayEvent(){
    try {
      const res = await fetch(`/api/v1/events/${event.id}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`We couldn't retrieve the event details.`);
      }

      const data = await res.json();
      setDisplayEvent({display: true, event: data})
      setProfile((prev) => ({...prev, display: false}))

    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="eventBanner" onClick={() => displayEvent()}>
      <img src={event.cover_image_url} alt="" />
      <h2>{event.title}</h2>
      <p>{event.date}</p>
      <p>{event.location}</p>
    </div>
  );
}
