import React, { useState, useRef, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import "../assets/stylesheets/eventForm.css";
import { setNewElements } from "../assets/helpers";

export default function EventForm({ loggedUser, setDisplayEventForm }) {
  let [eventDetails, setEventDetails] = useState({
    organisers: [loggedUser],
    title: "",
    description: "",
    date: "",
    location: "",
    coverImage: null,
  });
  const [locationSearchFocus, setLocationSearchFocus] = useState(false);
  const [locations, setLocations] = useState([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  let organiserUuids = eventDetails.organisers.map((org) => org[0].uuid);

  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  const textareaRef = useRef(null);
  const debouncedSearch = useMemo(() => debounce((search) => getLocations(search), 200));

  useEffect(() => {
    resizeTextArea();
  }, [eventDetails.description]);

  useEffect(() => {
    setChats([]);
    setNewElements(`/api/v1/users/group?search=${searchTerm}`, "chat_users", setChats);
  }, [searchTerm]);

  async function createEvent(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("event[title]", eventDetails.title);
    formData.append("event[description]", eventDetails.description);
    formData.append("event[date]", eventDetails.date);
    formData.append("event[location]", eventDetails.location);
    formData.append("event[cover_image]", eventDetails.coverImage);
    organiserUuids.forEach((uuid) => formData.append("event[organisers][]", uuid));

    try {
      const res = await fetch(`/api/v1/events/create`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`We couldn't create the event.`);
      }

      const data = await res.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  function resizeTextArea() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }

  async function getLocations(search) {
    try {
      const res = await fetch(`/api/v1/events/locations?search=${search}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`We couldn't retrieve location data.`);
      }

      const data = await res.json();
      setLocations(data["locations"]);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="eventFormContainer">
      <div className="eventPreview">
        {imagePreviewUrl && <img src={imagePreviewUrl} alt="The cover image of your project." />}
        {eventDetails.title.length > 1 && <h2 className="eventPageTitle"> {eventDetails.title} </h2>}
        {eventDetails.organisers.map((organiser) => {
          return (
            <div className="organiserContainer">
              <img
                className="smallAvatar"
                src={organiser[0].avatar ? organiser[0].avatar : "user_dark.svg"}
                alt={organiser[0].name + "'s profile picture"}
              />
              <p>{organiser[0].name}</p>
            </div>
          );
        })}
        <p>{eventDetails.date}</p>
        <p>{eventDetails.location}</p>
        <p>{eventDetails.description}</p>
      </div>

      <form
        className="eventForm"
        onSubmit={(e) => {
          createEvent(e);
          setDisplayEventForm(false)
        }}
      >
        <div className="organiserSearchContainer">
          <label>
            <input
              className="eventTitle"
              type="text"
              placeholder="Add Organisers"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          {chats.map((user, i) => (
            <button
              type="button"
              key={user[0].uuid}
              className="userContainer"
              onClick={() => {
                setEventDetails((prev) => ({ ...prev, organisers: [...prev.organisers, user] }));
                setChats((prev) => prev.filter((_, index) => i != index));
              }}
              data-testid="groupFormUserBtn"
            >
              <div className="userHeader">
                <img
                  className="smallAvatar"
                  src={user[0].avatar ? user[0].avatar : "user_dark.svg"}
                  alt={user[0].name + "'s profile picture"}
                />
                <h4 className="userName">{user[0].name}</h4>
              </div>
            </button>
          ))}
        </div>
        <label>
          <input
            className="eventTitle"
            type="text"
            placeholder="Event Title"
            onChange={(e) => {
              setEventDetails((prev) => ({ ...prev, title: e.target.value }));
            }}
          />
        </label>

        <label>
          Date:
          <input
            className="datePicker"
            type="date"
            onChange={(e) => setEventDetails((prev) => ({ ...prev, date: e.target.value }))}
          />
        </label>

        <label>
          <input
            className="eventTitle"
            type="text"
            placeholder="Location"
            onChange={(e) => {
              debouncedSearch(e.target.value);
              setLocationSearchFocus(true);
            }}
          />
          {locationSearchFocus &&
            locations.map((location) => (
              <button
                key={location.id}
                onClick={() => {
                  setLocationSearchFocus(false);
                  setEventDetails((prev) => ({ ...prev, location: location.name }));
                }}
              >
                {location.name}
              </button>
            ))}
        </label>

        <label>
          <textarea
            className="descriptionInput"
            placeholder="Event Description"
            onChange={(e) => {
              setEventDetails((prev) => ({ ...prev, description: e.target.value }));
            }}
            ref={textareaRef}
          />
          <p className="descrLimitCounter">{2000 - eventDetails.description.length}</p>
        </label>

        <div className="eventImgFormContainer">
          <input
            type="file"
            accept="image/*"
            id="file"
            style={{ display: "none" }}
            onChange={(e) => {
              setEventDetails((prev) => ({ ...prev, coverImage: e.target.files[0] }));
              setImagePreviewUrl(URL.createObjectURL(e.target.files[0]));
            }}
          />
          <label htmlFor="file" className="iconContainer profileIconContainer">
            <p style={{ color: "white" }}>Upload Image</p>
            <img className="icon" src="chevron-up.svg" alt="An icon of an arrow pointing up" />
          </label>
          <button type="button" className="iconContainer profileIconContainer">
            Set event image
            <img className="icon" src="save.svg" alt="An icon of a save file" />
          </button>
        </div>

        <button className="iconContainer eventBtn" type="submit">
          Post event
        </button>
      </form>
    </div>
  );
}
