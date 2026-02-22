import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/chat.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { updateListEndMessage, updatePagination } from "../assets/helpers";
import consumer from "../channels/consumer";
import UserListForm from "./UserListForm";
import UserList from "./UserList";

export default function Chat({ receivers, loggedUser, setMainDisplay, chatList, setChatList, setDimmed }) {
  const [chat, setChat] = useState({
    chat_id: receivers[0]?.chat_id || null,
    messages: [],
    name: null,
  });
  const [message, setMessage] = useState("");
  const [scrollTop, setScrollTop] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const [displayChatNameForm, setDisplayChatNameForm] = useState(false);
  const [displayUserListForm, setDisplayUserListForm] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [displayMemberList, setDisplayMemberList] = useState(false);
  const chatRef = useRef(null);
  const subscriptionRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  const receiver_uuids = receivers.map((receiver) => receiver.uuid);

  async function updateReadStatus(chat_id) {
    try {
      const res = await fetch(`/api/v1/chats/update_read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ chat: { chat_id: chat_id } }),
      });

      if (!res.ok) {
        throw new Error(`The read status could not be updated.`);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setChat({ chat_id: receivers[0]?.chat_id, messages: [] });
    setDisplayChatNameForm(false);
    setDisplayMenu(false);
    setDisplayMemberList(false);
    if (pagination.page > 1) getChat(1);
  }, [receivers]);

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = scrollTop + scrollTop * 0.1 - 0.1;

    if (receivers[0] && scrollTop > scrollThreshold && !pagination.loading) {
      getChat();
    }
  }, [receivers[0], scrollTop]);

  async function getChat(page = pagination.page) {
    if (page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    try {
      setPagination((prev) => ({ ...prev, loading: true }));

      const res = await fetch(`/api/v1/chats/${receivers[0].chat_id}?page=${page}`, {
        method: "GET"
      })

      if (!res.ok) {
        throw new Error(`The chat could not be opened.`);
      }

      const data = await res.json();
      setChat((prev) => ({
        chat_id: data.chat_id,
        messages: [...prev.messages, ...data.messages],
        name: data.name,
      }));

      subscribeToChat(data.chat_id);
      updateReadStatus(data.chat_id);
      updatePagination(setPagination, data.metadata.pages);

      return data;
    } catch (error) {
      console.error(error.message);
    } finally {
      setPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  function subscribeToChat(chat_id) {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = consumer.subscriptions.create(
      { channel: "ChatChannel", room: chat_id },
      {
        received(data) {
          setChat((prev) => ({
            ...prev,
            messages: [data, ...prev.messages],
          }));
        },
      }
    );
  }

  async function sendMessage(e, message) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          message: { content: message, receiver_uuids: receiver_uuids, chat_id: chat.chat_id },
        }),
      });

      if (!res.ok) {
        throw new Error(`The message could not be sent.`);
      }

      setMessage("");
      updateChatList();
    } catch (error) {
      console.error(error.message);
    }
  }

  function updateChatList() {
    if (isMobile || chatList[0][0].uuid == receivers[0].uuid) return;

    setChatList((prev) => {
      const filtered = prev.filter((user) => user[0].uuid != receivers[0].uuid);
      return [
        receivers.map((user) => {
          return {
            avatar: user.avatar,
            chat_id: chat.chat_id,
            chat_name: chat.name,
            description: user.description,
            name: user.name,
            read: true,
            uuid: user.uuid,
          };
        }),
        ...filtered,
      ];
    });
  }

  async function updateChatName(name) {
    setChat((prev) => ({ ...prev, name }));

    try {
      const res = await fetch("/api/v1/chats/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          chat: { chat_id: chat.chat_id, name: name },
        }),
      });

      if (!res.ok) {
        throw new Error(`The chat name could not be updated.`);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  async function addUsers(e, users) {
    e.preventDefault();
    const user_uuids = users.map((u) => u[0].uuid);

    try {
      const res = await fetch("/api/v1/chats/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          chat: { chat_id: chat.chat_id, receiver_uuids: user_uuids },
        }),
      });

      if (!res.ok) {
        throw new Error(`The users could not be added.`);
      }

      setMainDisplay((prev) => {
        const last = prev.at(-1);

        return [
          ...prev.slice(0, -1),
          {
            ...last,
            type: "chat",
            receivers: [...last.receivers, ...users.flat()],
          },
        ];
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  function displayProfile() {
    if (receivers.length == 1) setMainDisplay((prev) => [...prev, { type: "profile", user: receivers }]);
  }

  useEffect(() => {
    const handleScroll = () => {
      throttle(() => {
        setScrollTop(chatRef.current.scrollTop);
      }, 50);
    };

    const ref = chatRef.current;
    if (!ref) return;

    ref.addEventListener("scroll", handleScroll);
    return () => ref.removeEventListener("scroll", handleScroll);
  }, []);

  async function leaveChat(e) {
    e.preventDefault();

    try {
      const res = await fetch(`/api/v1/chats/leave`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ chat_membership: { chat_id: chat.chat_id } }),
      });

      if (!res.ok) {
        throw new Error("Failed to leave the chat.");
      }

      setMainDisplay((prev) => prev.slice(0, -1));
      setChatList((prev) => prev.filter((chat) => chat[0].name != chat.name));
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="chatContainer" data-testid="chatContainer">
      {receivers[0] && (
        <div className="userHeader">
          <div
            className="chatIconContainer"
            onClick={() => {
              setMainDisplay((prev) => prev.slice(0, -1));
            }}
            data-testid="chatBackArrow"
          >
            <img className="icon" src="arrow-left.svg" />
          </div>
          <div className="userHeaderPortal" data-testid="userChatHeader">
            <img
              className="bigAvatar"
              src={receivers.length > 1 ? "group.svg" : receivers[0].avatar || "user.svg"}
              alt={receivers.name + "'s profile picture"}
              data-testid="chatAvatar"
              onClick={() => displayProfile()}
            />

            {displayChatNameForm ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDisplayChatNameForm(false);
                  updateChatName(e.target.elements[0].value);
                }}
              >
                <input type="text" minLength={1} maxLength={50} autoFocus />
              </form>
            ) : (
              <>
                <h1 className="chatUserName" data-testid="chatUserName" onClick={() => displayProfile()}>
                  {chat.name ||
                    receivers
                      .slice(1)
                      .reduce((result, receiver) => result + ", " + receiver.name, receivers[0].name)}
                </h1>

                <img
                  className="chatIconContainer "
                  src="edit-3.svg"
                  alt="Edit icon"
                  onClick={() => setDisplayChatNameForm(true)}
                />
              </>
            )}
          </div>
          <div
            className="chatIconContainer menuBtn"
            onClick={() => {
              setDisplayMenu(!displayMenu);

              if (displayMemberList) {
                setDisplayMenu(false);
                setDisplayMemberList(false);
              }
            }}
          >
            <img className="icon" src="menu.svg" />
          </div>
          {displayMenu && (
            <div className="menu">
              <button
                className="iconContainer"
                onClick={() => {
                  setDisplayMenu(false);
                  setDisplayUserListForm(true);
                }}
              >
                <img className="icon" src="trekking.svg" />
                <img className="icon" src="trekking.svg" />
                <p>Add User</p>
              </button>
              <button
                className="iconContainer"
                onClick={() => {
                  setDisplayMemberList(true);
                  setDisplayMenu(false);
                }}
              >
                <img className="icon" src="page.svg" />
                <p>Members{"(" + (receivers.length + 1) + ")"}</p>
              </button>
              {receivers.length > 1 && (
                <button className="iconContainer" onClick={(e) => leaveChat(e)}>
                  <img className="icon" src="walking.svg" />
                  <p>Leave</p>
                </button>
              )}
            </div>
          )}
          {displayUserListForm && (
            <UserListForm
              setDimmed={setDimmed}
              setDisplayUserListForm={setDisplayUserListForm}
              setPagination={setPagination}
              callback={addUsers}
              filter={receivers}
            />
          )}
          {displayMemberList && (
            <div className="menu memberList">
              <UserList setMainDisplay={setMainDisplay} listToShow={[...receivers, ...loggedUser]} />
            </div>
          )}
        </div>
      )}

      <div ref={chatRef} className="msgContainer" data-testid="msgList">
        {chat.messages &&
          chat.messages.map((message, i) => {
            if (message.user_uuid == loggedUser[0].uuid) {
              return (
                <div className="messageContent pushRight" key={i} data-testid="msg">
                  <p>{message.content}</p>
                  <img
                    className="smallAvatar"
                    src={loggedUser[0].avatar ? loggedUser[0].avatar : "user_dark.svg"}
                    alt={loggedUser[0].name + "'s profile picture"}
                  />
                </div>
              );
            } else {
              return (
                <div className="message" key={i} data-testid="msg">
                  {receivers.length > 1 && chat.messages[i + 1]?.user_uuid != message.user_uuid && (
                    <h4 className="chatUserName">{message.user_name}</h4>
                  )}
                  <div className="messageContent">
                    <img
                      className="smallAvatar"
                      src={receivers.avatar ? receivers.avatar : "user_dark.svg"}
                      alt={receivers.name + "'s profile picture"}
                    />
                    <p>{message.content}</p>
                  </div>
                </div>
              );
            }
          })}
      </div>
      {receivers[0] && (
        <form
          className="messageForm"
          autoComplete="off"
          onSubmit={(e) => {
            sendMessage(e, message);
            updateReadStatus(chat.chat_id);

            setChatList((prev) => {
              const index = prev.findIndex((u) => u[0].chat_id === chat.chat_id);
              if (index < 0) return prev;
              const updated = [...prev];
              updated[index] = updated[index].map((user) => {
                return { ...user, read: true };
              });
              return updated;
            });
          }}
        >
          <input
            className="msgInput"
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            data-testid="chatInput"
          />
          <button className="chatIconContainer sendButton" data-testid="sendButton">
            <img className="icon" src="send.svg" alt="A send icon" />
          </button>
        </form>
      )}
    </div>
  );
}

