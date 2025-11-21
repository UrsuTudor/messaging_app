import React, { use, useEffect, useState, useRef } from "react";
import EventBanner from "./EventBanner";
import SearchBar from "./SearchBar";
import { setNewElements, updateScrollBottom } from "../assets/helpers";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import "../assets/stylesheets/eventList.css";

export default function EventList({setDisplayEvent, setProfile}){
  const [searchTerm, setSearchTerm] = useState("")
  const [events, setEvents] = useState([])
  const [pagination, setPagination] = usePagination();
  const [scrollBottom, setScrollBottom] = useScrolling();
  const eventListRef = useRef(null);

  useEffect(() => {
    const scrollThreshold = eventListRef.current.scrollHeight * 0.1;
    if (pagination.page <= 1) setEvents([]);

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      setNewElements(
        `/api/v1/events/all?page=${pagination.page}&search=${searchTerm}`,
        "events",
        setEvents,
        setPagination
      );
    }
  }, [scrollBottom, searchTerm]);

  async function getEvents(){
    try {
      const res = await fetch(`/api/v1/events/all?page=${pagination.page}&search=${searchTerm}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`We couldn't retrieve a list of events.`);
      }

      const data = await res.json();
      setEvents(data)

    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="eventListContainer" ref={eventListRef}>
      <div className="eventListHeader">
        <SearchBar setPagination={setPagination} setSearchTerm={setSearchTerm} adaptable={false} />
      </div>

      {events.map((e) => (
        <EventBanner key={e.id} event={e} setDisplayEvent={setDisplayEvent} setProfile={setProfile} hereFrom={"home"}/>
      ))} 
    </div>
  )
}
