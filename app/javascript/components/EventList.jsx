import React, { use, useEffect, useState, useRef } from "react";
import EventBanner from "./EventBanner";
import SearchBar from "./SearchBar";
import { setNewElements, updateScrollBottom } from "../assets/helpers";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import useThrottle from "../assets/hooks/useThrottle";
import "../assets/stylesheets/eventList.css";

export default function EventList({ setDisplayEvent, setDisplayEventForm, setProfile }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = usePagination();
  const [scrollBottom, setScrollBottom] = useScrolling();
  const eventListRef = useRef(null);
  const throttle = useThrottle();

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

  useEffect(() => {
    const throttledUpdateScrollBottom = () =>
      throttle(() => updateScrollBottom(setScrollBottom, eventListRef.current), 50);
    eventListRef.current.addEventListener("scroll", throttledUpdateScrollBottom);

    return () => {
      if (eventListRef.current) {
        eventListRef.current.removeEventListener("scroll", throttledUpdateScrollBottom);
      }
    };
  }, []);

  return (
    <div className="eventListContainer" ref={eventListRef}>
      <div className="listHeader">
        <h1>Events</h1>
      </div>
      <div className="eventListSearchBar">
        <SearchBar
          setPagination={setPagination}
          setSearchTerm={setSearchTerm}
          adaptable={false}
          placeholder="Search by title or location"
        />
        <button
          onClick={() => setDisplayEventForm({ display: true, event: null, action: "create" })}
          className="iconContainer profileIconContainer"
        >
          Create your own
        </button>
      </div>

      <div className="bannerListContainer">
        {events.map((e) => (
          <EventBanner
            key={e.id}
            event={e}
            setDisplayEvent={setDisplayEvent}
            setProfile={setProfile}
            hereFrom={"home"}
          />
        ))}
      </div>
    </div>
  );
}
