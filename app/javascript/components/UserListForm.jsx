import React, { useEffect, useState } from "react";
import "../assets/stylesheets/groupForm";
import SearchBar from "./SearchBar";
import { createPortal } from "react-dom";
import { setNewElements } from "../assets/helpers";

export default function UserListForm({
  setDimmed,
  setDisplayUserListForm,
  setPagination,
  callback
}) {
  const [chats, setChats] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setChats([]);
    setNewElements(`/api/v1/users/group?search=${searchTerm}`, "chat_users", setChats);
  }, [searchTerm]);

  return (
    <>
      {createPortal(
        <form
          className="groupForm"
          onSubmit={(e) => {
            callback(e, userList);
            setDimmed(false);
            setDisplayUserListForm(false);
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
              disabled={!userList[0]}
              className={
                userList[0] ? "iconContainer groupSubmitBtn visible" : "iconContainer groupSubmitBtn hidden"
              }
            >
              Create
            </button>
            <img
              className="chatIconContainer edgeBtn"
              src="xmark.svg"
              alt="Close group form"
              onClick={() => {
                setDisplayUserListForm(false);
                setDimmed(false);
              }}
            />
          </div>
          <div className="groupList">
            {userList.map((user) => (
              <button
                type="button"
                key={user.uuid}
                className="groupListUser"
                onClick={() => {
                  setUserList((prev) => prev.filter((u) => u.uuid !== user.uuid));
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
          {chats.map((user) => (
            <button
              type="button"
              key={user[0].uuid}
              className="userContainer"
              onClick={() => {
                setUserList((prev) => [...prev, user[0]]);
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
