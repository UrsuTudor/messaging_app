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

export default function ChatList({
  setDisplayChat,
  setReceiver,
  setProfile,
  chatList,
  setChatList,
  setDimmed,
}) {
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
          pagination.page
        );
      },
    }
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
        setPagination
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

    const cleanup = handleResize(setDisplaySearchBar);
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

      setReceiver(
        userList.map((user) => {
          return {
            avatar: user[0].avatar,
            name: user[0].name,
            uuid: user[0].uuid,
            description: user[0].description,
            chat_id: data.chat_id,
          };
        })
      );
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className={displaySearchBar ? "chatListContainer widen" : "chatListContainer"}>
      <div className="listHeader">
        <h1>Chats</h1>
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
          onClick={() => {
            setDisplayUserListForm(true);
            setDimmed(true);
          }}
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
              setProfile({ display: false, user: null });
              setReceiver(
                user.map((user) => {
                  return {
                    avatar: user.avatar,
                    name: user.name,
                    uuid: user.uuid,
                    description: user.description,
                    chat_id: user.chat_id,
                  };
                })
              );
              setDisplayChat({ chat: true, chatList: true });
              setChatList((prev) => {
                const index = prev.findIndex((u) => u[0].chat_id === user[0].chat_id);
                const updated = [...prev];
                updated[index] = updated[index].map((user) => {
                  return { ...user, read: true };
                });
                return updated;
              });
              if (isMobile) {
                setDisplayChat({ chat: true, chatList: false });
              }
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
      {isMobile && (
        <>
          <UserList setReceiver={setReceiver} setProfile={setProfile} setDisplayChat={setDisplayChat} />
        </>
      )}
    </div>
  );
}
