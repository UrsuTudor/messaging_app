import React, { useEffect, useState, useRef, use } from "react";
import "../assets/stylesheets/chat.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { updateListEndMessage, updatePagination } from "../assets/helpers";
import consumer from "../channels/consumer";

export default function Chat({ receiver, loggedUser, setProfile, setDisplayChat, setRefetchChatList }) {
  const [chat, setChat] = useState({chat_id: "", messages: []});
  const [message, setMessage] = useState("");
  const [scrollTop, setScrollTop] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const chatRef = useRef(null);
  const subscriptionRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setChat({chat_id: "", messages: []});
    if (pagination.page > 1) getChat(1);
  }, [receiver]);

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = scrollTop + scrollTop * 0.1 - 0.1;

    if (receiver.uuid && scrollTop > scrollThreshold && !pagination.loading) {
      getChat();
    }
  }, [receiver.uuid, scrollTop]);

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
        body: JSON.stringify({ chat: { receiver_uuid: receiver.uuid } }),
      });

      if (!res.ok) {
        throw new Error(`The chat could not be opened.`);
      }

      const data = await res.json();
      setChat((prev) => ({
        chat_id: data.chat_id,
        messages: [...prev.messages, ...data.messages],
      }));

      subscribeToChat(data.chat_id)

      updatePagination(setPagination, data.metadata.pages);
      return data;
    } catch (error) {
      console.error(error.message);
    } finally {
      setPagination((prev) => ({ ...prev, loading: false }));
    }
  }

  function subscribeToChat(chat_id){
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
        body: JSON.stringify({ message: { content: message, receiver_uuid: receiver.uuid } }),
      });

      if (!res.ok) {
        throw new Error(`The message could not be sent.`);
      }

      setMessage("");

      if (chat.length == 0) {
        setRefetchChatList(true);
      }
    } catch (error) {
      console.error(error.message);
    }
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
      {receiver.uuid && (
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
              setProfile({ display: true, user: receiver });
              if (isMobile) {
                setDisplayChat({ chat: false, chatList: true });
              }
            }}
            data-testid="userChatHeader"
          >
            <img
              className="bigAvatar"
              src={receiver.avatar ? receiver.avatar : "user.svg"}
              alt={receiver.name + "'s profile picture"}
              data-testid="chatAvatar"
            />
            <h1 data-testid="chatUserName">{receiver.name}</h1>
          </div>
        </div>
      )}
      <div ref={chatRef} className="msgContainer" data-testid="msgList">
        {chat.messages &&
          chat.messages.map((message, i) => {
            if (message.user_uuid == receiver.uuid) {
              return (
                <div className="message" key={i} data-testid="msg">
                  <img
                    className="smallAvatar"
                    src={receiver.avatar ? receiver.avatar : "user_dark.svg"}
                    alt={receiver.name + "'s profile picture"}
                  />
                  <p>{message.content}</p>
                </div>
              );
            } else {
              return (
                <div className="message pushRight" key={i} data-testid="msg">
                  <p>{message.content}</p>
                  <img
                    className="smallAvatar"
                    src={loggedUser.avatar ? loggedUser.avatar : "user_dark.svg"}
                    alt={loggedUser.name + "'s profile picture"}
                  />
                </div>
              );
            }
          })}
      </div>
      {receiver.uuid && (
        <form className="messageForm" autoComplete="off" onSubmit={(e) => sendMessage(e, message)}>
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
