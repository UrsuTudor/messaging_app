import React, { useState, useRef, useEffect } from "react";
import "../assets/stylesheets/profile.css";
import EventBanner from "./EventBanner";

export default function Profile({ loggedUser, getLoggedUser, user, setMainDisplay }) {
  const [renderDescriptionForm, setRenderDescriptionForm] = useState(false);
  const [description, setDescription] = useState({
    content: user[0]?.description,
    length: user[0]?.description ? user[0]?.description.length : 0,
  });
  const [renderAvatarForm, setRenderAvatarForm] = useState(false);
  const [avatar, setAvatar] = useState(user[0]?.avatar);
  const [feedback, setFeedback] = useState(null);
  const [eventListDisplay, setEventListDisplay] = useState("upcoming");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  const textareaRef = useRef(null);

  const today = new Date();
  let pastEvents = [];
  let upcomingEvents = [];

  if (user[0].events)
    user[0].events.forEach((e) => {
      const eventDate = new Date(e.date);

      if (today > eventDate) {
        pastEvents.push(e);
      } else {
        upcomingEvents.push(e);
      }
    });

  useEffect(() => {
    resizeTextArea();
  }, [description]);

  function resizeTextArea() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }

  async function updateDescription(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/v1/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ user: { description: description.content } }),
      });

      setFeedback("Your description has been updated successfully!");
      getLoggedUser();
      setRenderDescriptionForm(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  function checkImage() {
    const validTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!(avatar instanceof File)) {
      setFeedback("Please upload a valid image type (jpeg/png).");
      return false;
    }
    if (!validTypes.includes(avatar.type)) {
      setFeedback("Please upload a valid image type (jpeg/png).");
      return false;
    }

    if (avatar.size > maxSize) {
      setFeedback("Please upload an image that is under 5MB in size.");
      return false;
    }

    return true;
  }

  async function updateProfilePicture(e) {
    e.preventDefault();
    const imageIsValid = checkImage();

    if (!imageIsValid) return;

    const formData = new FormData();
    formData.append("user[avatar]", avatar);

    try {
      const res = await fetch("/api/v1/users/update", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: formData,
      });

      setFeedback("Your profile picture has been updated successfully!");
      setRenderAvatarForm(false);
      getLoggedUser();
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="userProfile">
      <div className="generalInfoContainer">
        <div className="profileHeader">
          <div
            className="chatIconContainer"
            onClick={() => { setMainDisplay((prev) => [...prev.slice(0, -1)])}}
            data-testid="chatBackArrow"
          >
            <img className="icon" src="green-arrow-left.svg" />
          </div>
          <h1 data-testid="profileUserName">{user[0]?.name}</h1>
        </div>
        <div className="imageContainer">
          <img
            className="profileImage"
            src={user[0]?.avatar ? user[0]?.avatar : "user_dark.svg"}
            alt={user[0]?.name + "'s profile picture"}
            data-testid="userAvatar"
          />

          {renderAvatarForm ? (
            <form className="avatarForm">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="file"
                  style={{ display: "none" }}
                  onChange={(e) => setAvatar(e.target.files[0])}
                />
                <label htmlFor="file" className="iconContainer profileIconContainer">
                  <p style={{ color: "white" }}>Upload File</p>
                  <img className="icon" src="chevron-up.svg" alt="An icon of an arrow pointing up" />
                </label>
                <button
                  type="button"
                  className="iconContainer profileIconContainer"
                  onClick={updateProfilePicture}
                >
                  Update profile picture
                  <img className="icon" src="save.svg" alt="An icon of a save file" />
                </button>
              </div>
            </form>
          ) : (
            loggedUser[0].uuid == user[0]?.uuid && (
              <button
                className="iconContainer profileIconContainer"
                onClick={() => setRenderAvatarForm(true)}
              >
                Change profile picture
                <img className="icon" src="edit-3.svg" alt="An edit icon" />
              </button>
            )
          )}
        </div>

        <div className="descriptionContainer">
          {renderDescriptionForm ? (
            <form className="descriptionForm">
              <label htmlFor="description">
                <textarea
                  className="descriptionInput"
                  id="description"
                  ref={textareaRef}
                  value={description.content}
                  onChange={(e) => {
                    description.length >= 500
                      ? setFeedback("Your description cannot be longer than 500 characters.")
                      : setFeedback("");
                    setDescription({ content: e.target.value, length: e.target.value.length });
                  }}
                ></textarea>
                <p className="descrLimitCounter">{500 - description.length}</p>
                <button
                  className="iconContainer profileIconContainer"
                  data-section="description"
                  onClick={updateDescription}
                  disabled={description.length > 500 ? true : false}
                >
                  Update description
                  <img className="icon" src="edit-3.svg" alt="An edit icon" />
                </button>
              </label>
            </form>
          ) : (
            <div>
              {description.length > 0 && <p className="description">{user[0]?.description}</p>}
              {loggedUser[0].uuid == user[0]?.uuid && (
                <button
                  className="iconContainer profileIconContainer"
                  data-section="description"
                  onClick={() => {
                    setRenderDescriptionForm(true);
                    requestAnimationFrame(() => resizeTextArea());
                  }}
                >
                  <p>Change description</p>
                  <img className="icon" src="edit-3.svg" alt="An edit icon" />
                </button>
              )}
            </div>
          )}
        </div>
        {feedback && (
          <p className="feedbackMsg" data-testid={"feedback"}>
            {feedback}
          </p>
        )}
      </div>
      <div className="userEvents">
        <h1>{loggedUser[0].name}'s Events</h1>
        <div className="eventListBtnsContainer">
          <button
            className="eventListBtn iconContainer profileIconContainer"
            onClick={() => setEventListDisplay("upcoming")}
          >
            Upcoming
          </button>
          <button
            className="eventListBtn iconContainer profileIconContainer"
            onClick={() => setEventListDisplay("old")}
          >
            Old
          </button>
        </div>

        <div>
          {eventListDisplay === "upcoming"
            ? upcomingEvents.map((e) => (
                <EventBanner
                  key={e.id}
                  event={e}
                  setMainDisplay={setMainDisplay}
                />
              ))
            : pastEvents.map((e) => (
                <EventBanner
                  key={e.id}
                  event={e}
                  setMainDisplay={setMainDisplay}
                />
              ))}
        </div>

        {eventListDisplay === "upcoming"
          ? upcomingEvents.length == 0 && (
              <p className="emptyEventListMsg">
                {user[0].name} is not participanting in any upcoming events.{" "}
              </p>
            )
          : pastEvents.length == 0 && (
              <p className="emptyEventListMsg">{user[0].name} has not participated in any past events. </p>
            )}
      </div>
    </div>
  );
}
