import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/chatList";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom, handleResize } from "../assets/helpers";
import UserList from "./UserList";
import SearchBar from "./SearchBar";
import consumer from "../channels/consumer";
import UserListForm from "./UserListForm";
import { reverse } from "lodash";

export default function ChatList({ mainDisplay, setMainDisplay, chatList, setChatList, setDimmed }) {
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const [displayUserListForm, setDisplayUserListForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchBar, setDisplaySearchBar] = useState(false);
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  const chatListRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;

  consumer.subscriptions.create(
    { channel: "ChatListChannel" },
    {
      received() {
        setPagination((prevPagination) => ({ ...prevPagination, page: 1 }));
        setChatList([]);

        setNewElements(
          `/api/v1/users/chats?page=${1}`,
          "chat_users",
          setChatList,
          setPagination,
          pagination.page,
        );
      },
    },
  );

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = chatListRef.current.scrollHeight * 0.1;
    if (pagination.page <= 1) setChatList([]);

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      setNewElements(
        `/api/v1/users/chats?page=${pagination.page}&search=${searchTerm}`,
        "chat_users",
        setChatList,
        setPagination,
      );
    }
  }, [scrollBottom, searchTerm]);

  useEffect(() => {
    const throttledUpdateScrollBottom = () =>
      throttle(() => updateScrollBottom(setScrollBottom, chatListRef.current), 50);

    chatListRef.current.addEventListener("scroll", throttledUpdateScrollBottom);

    return () => {
      if (chatListRef.current) {
        chatListRef.current.removeEventListener("scroll", throttledUpdateScrollBottom);
      }
    };
  }, []);

  useEffect(() => {
    setDisplaySearchBar(window.innerWidth > 1400);

    const cleanup = handleResize(setDisplaySearchBar, 1400);
    return cleanup;
  }, []);

  async function createGroup(e, userList) {
    e.preventDefault();
    let receiver_uuids = userList.map((user) => user[0].uuid);

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

      setMainDisplay((prev) => [
        ...prev,
        {
          type: "chat",
          receivers: userList.map((user) => {
            return {
              avatar: user[0].avatar,
              name: user[0].name,
              uuid: user[0].uuid,
              description: user[0].description,
              chat_id: data.chat_id,
            };
          }),
        },
      ]);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className={displaySearchBar ? "chatListContainer widen" : "chatListContainer"}>
      <div className="listHeader">
        {isMobile && (
          <div
            className="chatIconContainer"
            onClick={() => {
              setMainDisplay((prev) => prev.slice(0, -1));
            }}
            data-testid="chatBackArrow"
          >
            <img className="icon" src="arrow-left.svg" />
          </div>
        )}
        <h1 className="chatListTitle">Chats</h1>
        <SearchBar
          setPagination={setPagination}
          setSearchTerm={setSearchTerm}
          displaySearchBar={displaySearchBar}
          setDisplaySearchBar={setDisplaySearchBar}
        />
        <img
          className="chatIconContainer"
          src="group.svg"
          alt="Create a group"
          onClick={() => setDisplayUserListForm(true)}
        />
        {displayUserListForm && (
          <UserListForm
            setDimmed={setDimmed}
            setDisplayUserListForm={setDisplayUserListForm}
            setPagination={setPagination}
            callback={createGroup}
          />
        )}
      </div>

      <div ref={chatListRef} className={isMobile ? "chatList mobileList" : "chatList"} data-testid="chatList">
        {chatList.map((user) => (
          <button
            key={user[0].chat_id}
            className="userContainer"
            onClick={() => {
              let receivers = user.map((user) => {
                return {
                  avatar: user.avatar,
                  name: user.name,
                  uuid: user.uuid,
                  description: user.description,
                  chat_id: user.chat_id,
                };
              });

              // if the user was looking at another chat, I don't want multiple chats to pile in the queue and clog the
              // "back button" behavior, considering they can easily re-open a previous chat by clicking on it in the chat
              // list; but if the user was looking at something like a profile or an event, I want them to be able to
              // easily go back to that from a chat
              mainDisplay.at(-1)?.type == "chat"
                ? setMainDisplay((prev) => [...prev.slice(0, -1), { type: "chat", receivers: receivers }])
                : setMainDisplay((prev) => [...prev, { type: "chat", receivers: receivers }]);

              setChatList((prev) => {
                const index = prev.findIndex((u) => u[0].chat_id === user[0].chat_id);
                const updated = [...prev];
                updated[index] = updated[index].map((user) => {
                  return { ...user, read: true };
                });
                return updated;
              });
            }}
            data-testid="chatListBtn"
          >
            <div className="userHeader">
              <img
                className="smallAvatar"
                src={user.length > 1 ? "group_dark.svg" : user[0].avatar || "user_dark.svg"}
                alt={user.name + "'s profile picture"}
              />
              <h4 className="userName">
                {user[0].chat_name
                  ? user[0].chat_name
                  : user.slice(1).reduce((result, u) => result + ", " + u.name, user[0].name)}
              </h4>
              {user[0].read ? null : (
                <img className="unreadIcon" src="bonfire.svg" alt="message notification" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
