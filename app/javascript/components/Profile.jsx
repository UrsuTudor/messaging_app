import React, { useState } from "react";
import "../assets/stylesheets/profile.css";

export default function Profile({ loggedUser, getLoggedUser, user }) {
  const [renderDescriptionForm, setRenderDescriptionForm] = useState(false);
  const [description, setDescription] = useState(user.description);

  const [renderAvatarForm, setRenderAvatarForm] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar);
  const [feedback, setFeedback] = useState(null);
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  async function updateDescription(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ user: { description: description } }),
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
      <div className="imageContainer">
        <h1>{user.name}</h1>
        <img className="profileImage" src={user.avatar ? user.avatar : "user.svg"} alt={user.name + "'s profile picture"} data-testid="userAvatar"/>

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
                <p>Upload File</p>
                <img className="icon" src="chevron-up.svg" alt="An icon of an arrow pointing up" />
              </label>
              <button type="button" className="iconContainer profileIconContainer" onClick={updateProfilePicture}>
                Update profile picture
                <img className="icon" src="save.svg" alt="An icon of a save file" />
              </button>
            </div>
          </form>
        ) : (
          loggedUser.uuid == user.uuid && (
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
            <h1></h1>
            <label htmlFor="description">
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                className="iconContainer profileIconContainer"
                data-section="description"
                onClick={updateDescription}
              >
                Update description
                <img className="icon" src="edit-3.svg" alt="An edit icon" />
              </button>
            </label>
          </form>
        ) : (
          <div>
            <h1></h1>
            <p>{user.description}</p>
            {loggedUser.uuid == user.uuid && (
              <button
                className="iconContainer profileIconContainer"
                data-section="description"
                onClick={() => setRenderDescriptionForm(true)}
              >
                <p>Change description</p>
                <img className="icon" src="edit-3.svg" alt="An edit icon" />
              </button>
            )}
          </div>
        )}
      </div>
      {feedback && <p className="feedbackMsg" data-testid={"feedback"}>{feedback}</p>}
    </div>
  );
}
