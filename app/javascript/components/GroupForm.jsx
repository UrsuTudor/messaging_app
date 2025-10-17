import React, { useEffect, useState } from "react";
import "../assets/stylesheets/groupForm";
import SearchBar from "./SearchBar";
import { createPortal } from "react-dom";
import { setNewElements } from "../assets/helpers";

export default function GroupForm({
  setDimmed,
  setDisplayGroupForm,
  setReceiver,
  setPagination,
}) {
  const [chats, setChats] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  useEffect(() => {
    setChats([]);
    setNewElements(`/api/v1/users/group?search=${searchTerm}`, "chat_users", setChats);
  }, [searchTerm]);

  async function createGroup(e) {
    e.preventDefault();
    let receiver_uuids = groupList.map((user) => user.uuid);

    try {
      const res = await fetch(`/api/v1//chats/open?`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ chat: { receiver_uuids: receiver_uuids } }),
      });

      if (!res.ok) {
        throw new Error("The group could not be created.");
      }

      const data = await res.json();

      setReceiver(
        groupList.map((user) => {
          return {
            avatar: user.avatar,
            name: user.name,
            uuid: user.uuid,
            description: user.description,
            chat_id: data.chat_id,
          };
        })
      );
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <>
      {createPortal(
        <form
          className="groupForm"
          onSubmit={(e) => {
            createGroup(e);
            setDimmed(false);
            setDisplayGroupForm(false);
          }}
        >
          <div className="listHeader">
            <SearchBar
              route={"api/v1/users/chats?page=1"}
              dataKey={"chat_users"}
              listSetter={setChats}
              setPagination={setPagination}
              adaptable={false}
              setSearchTerm={setSearchTerm}
            />
            <button
              type="submit"
              disabled={!groupList[0]}
              className={
                groupList[0] ? "iconContainer groupSubmitBtn visible" : "iconContainer groupSubmitBtn hidden"
              }
            >
              Create
            </button>
            <img
              className="chatIconContainer edgeBtn"
              src="xmark.svg"
              alt="Close group form"
              onClick={() => {
                setDisplayGroupForm(false);
                setDimmed(false);
              }}
            />
          </div>
          <div className="groupList">
            {groupList.map((user) => (
              <button
                type="button"
                key={user.uuid}
                className="groupListUser"
                onClick={() => {
                  setGroupList((prev) => prev.filter((u) => u.uuid !== user.uuid));
                  setChats((prev) => [[user], ...prev]);
                }}
              >
                <div className="userHeader">
                  <h4 className="userName">{user.name}</h4>
                  <img className="groupUserIcon" src="xmark.svg" alt="Remove user from group" />
                </div>
              </button>
            ))}
          </div>
          {chats.map((user, i) => (
            <button
              type="button"
              key={user[0].uuid}
              className="userContainer"
              onClick={() => {
                setGroupList((prev) => [...prev, user[0]]);
                setChats((prev) => prev.filter((u) => u[0].uuid !== user[0].uuid));
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
        </form>,
        document.body
      )}
    </>
  );
}
