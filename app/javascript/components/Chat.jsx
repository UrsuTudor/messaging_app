import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/chat.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { updateListEndMessage, updatePagination } from "../assets/helpers";
import consumer from "../channels/consumer";

export default function Chat({ receiver, loggedUser, setProfile, setDisplayChat, chatList, setChatList }) {
  const [chat, setChat] = useState({
    chat_id: receiver[0]?.chat_id || null,
    messages: [],
  });
  const [message, setMessage] = useState("");
  const [scrollTop, setScrollTop] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const chatRef = useRef(null);
  const subscriptionRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  const receiver_uuids = receiver.map((receiver) => receiver.uuid);

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
    setChat({ chat_id: receiver[0]?.chat_id, messages: [] });
    if (pagination.page > 1) getChat(1);
  }, [receiver]);

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = scrollTop + scrollTop * 0.1 - 0.1;

    if (receiver[0] && scrollTop > scrollThreshold && !pagination.loading) {
      getChat();
    }
  }, [receiver[0], scrollTop]);

  async function getChat(page = pagination.page) {
    if (page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    try {
      setPagination((prev) => ({ ...prev, loading: true }));
      
      const res = await fetch(`/api/v1/chats/open?page=${page}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },

        // using both receiver.chat_id and chat.chat_id, because for new chats receiver won't get automatically updated,
        // but the chat state will
        body: JSON.stringify({
          chat: { receiver_uuids: receiver_uuids, chat_id: receiver[0].chat_id || chat.chat_id },
        }),
      });

      if (!res.ok) {
        throw new Error(`The chat could not be opened.`);
      }

      const data = await res.json();
      setChat((prev) => ({
        chat_id: data.chat_id,
        messages: [...prev.messages, ...data.messages],
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
    if (isMobile || chatList[0].uuid == receiver.uuid) return;

    setChatList((prev) => {
      const filtered = prev.filter((user) => user.uuid != receiver.uuid);
      return [{ name: receiver.name, uuid: receiver.uuid, avatar: receiver.avatar }, ...filtered];
    });
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

  return (
    <div className="chatContainer" data-testid="chatContainer">
      {receiver[0] && (
        <div className="userHeader">
          {isMobile && (
            <div
              className="chatIconContainer"
              onClick={() => {
                setDisplayChat({ chat: false, chatList: true });
              }}
              data-testid="chatBackArrow"
            >
              <img className="icon" src="arrow-left.svg" />
            </div>
          )}

          <div
            className="userHeaderPortal"
            onClick={() => {
              if (receiver.length == 1) setProfile({ display: true, user: receiver });

              if (isMobile) {
                setDisplayChat({ chat: false, chatList: true });
              }
            }}
            data-testid="userChatHeader"
          >
            <img
              className="bigAvatar"
              src={receiver.length > 1 ? "group.svg" : receiver[0].avatar || "user.svg"}
              alt={receiver.name + "'s profile picture"}
              data-testid="chatAvatar"
            />
            <h1 data-testid="chatUserName">
              {receiver
                .slice(1)
                .reduce((result, receiver) => result + ", " + receiver.name, receiver[0].name)}
            </h1>
          </div>
        </div>
      )}
      <div ref={chatRef} className="msgContainer" data-testid="msgList">
        {chat.messages &&
          chat.messages.map((message, i) => {
            if (message.user_uuid == loggedUser.uuid) {
              return (
                <div className="messageContent pushRight" key={i} data-testid="msg">
                  <p>{message.content}</p>
                  <img
                    className="smallAvatar"
                    src={loggedUser.avatar ? loggedUser.avatar : "user_dark.svg"}
                    alt={loggedUser.name + "'s profile picture"}
                  />
                </div>
              );
            } else {
              return (
                <div className="message" key={i} data-testid="msg">
                  {receiver.length > 1 && chat.messages[i + 1]?.user_uuid != message.user_uuid && <h4 className="chatUserName">{message.user_name}</h4>}
                  <div className="messageContent">
                    <img
                      className="smallAvatar"
                      src={receiver.avatar ? receiver.avatar : "user_dark.svg"}
                      alt={receiver.name + "'s profile picture"}
                    />
                    <p>{message.content}</p>
                  </div>
                </div>
              );
            }
          })}
      </div>
      {receiver[0] && (
        <form
          className="messageForm"
          autoComplete="off"
          onSubmit={(e) => {
            sendMessage(e, message);
            updateReadStatus(chat.chat_id);

            setChatList((prev) => {
              const index = prev.findIndex((u) => u[0].chat_id === chat.chat_id);
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
