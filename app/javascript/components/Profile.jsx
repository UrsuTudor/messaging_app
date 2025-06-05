import React, { useState } from "react";
import "../assets/stylesheets/profile"

export default function Profile({ loggedUser, getLoggedUser, setProfileDisplay, user }) {
  const [renderDescriptionForm, setRenderDescriptionForm] = useState(false);
  const [description, setDescription] = useState(user.description);

  const [renderAvatarForm, setRenderAvatarForm] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar);
  const [feedback, setFeedback] = useState(null);
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

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
      setRenderDescriptionForm(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function updateProfilePicture(e) {
    e.preventDefault();
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
      setRenderAvatarForm(false)
      getLoggedUser()

    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="userProfile">
      <div className="imageContainer">
        <h1>{user.name}</h1>
        <img className="profileImage" src={user.avatar} alt={user.name + "'s profile picture"} />

        {renderAvatarForm ? (
          <form className="avatarForm">
            <div className="iconContainer" id="profileIconContainer" onClick={updateProfilePicture}>
              <input type="file" id="file" style={{display: "none"}} onChange={(e) => setAvatar(e.target.files[0])} />
              <label htmlFor="file">Upload File</label>
              <img className="icon" src="chevron-up.svg" alt="An icon of an arrow pointing up" />
            </div>

            <div className="iconContainer" id="profileIconContainer" onClick={updateProfilePicture}>
              <p>Update profile picture </p>
              <img className="icon" src="save.svg" alt="An icon of a save file" />
            </div>
          </form>
        ) : (
          <div className="iconContainer" id="profileIconContainer" onClick={() => setRenderAvatarForm(true)}>
            <p>Change profile picture </p>
            <img className="icon" src="edit-3.svg" alt="An edit icon" />
          </div>
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
            </label>
            <div className="iconContainer" id="profileIconContainer" data-section="description" onClick={updateDescription}>
              <p>Update description</p>
              <img className="icon" src="edit-3.svg" alt="An edit icon" />
            </div>
          </form>
        ) : (
          <div>
            <h1>{feedback && <span>{feedback}</span>}</h1>
            <p>{description}</p>
            {loggedUser.uuid == user.uuid && (
              <div className="iconContainer" id="profileIconContainer" data-section="description" onClick={() => setRenderDescriptionForm(true)}>
                <p>Change description</p>
                <img className="icon" src="edit-3.svg" alt="An edit icon" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
