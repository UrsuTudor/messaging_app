import React, { useState } from "react";

export default function Profile({ loggedUser, user }) {
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
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="userProfile">
      <img src={user.avatar} alt={user.name + "'s profile picture"} />
      {feedback && <p>{feedback}</p>}

      {renderAvatarForm ? (
        <form onSubmit={updateProfilePicture} className="descriptionForm">
          <label htmlFor="avatar">
            <input
              type="file"
              id="avatar"
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </label>
          <button type="submit">Update profile picture</button>
        </form>
      ) : (
        <button onClick={() => setRenderAvatarForm(true)}>
          Change profile picture
        </button>
      )}

      <h1>{user.name}</h1>

      {renderDescriptionForm ? (
        <form onSubmit={updateDescription} className="descriptionForm">
          <label htmlFor="description">
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button type="submit">Update description</button>
        </form>
      ) : (
        <div className="descriptionContainer">
          <p>{description}</p>
          {loggedUser.uuid == user.uuid && (
            <button onClick={() => setRenderDescriptionForm(true)}>
              Edit Description
            </button>
          )}
        </div>
      )}
    </div>
  );
}
