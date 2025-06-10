import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/chat.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { updateListEndMessage, updatePagination } from "../assets/helpers";

export default function Chat({
  receiver,
  loggedUser,
  setProfileDisplay,
  setUserForProfile,
  setDisplayChat,
  setDisplayChatList,
}) {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [scrollTop, setScrollTop] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const chatRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setChat([]);
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
      setChat((prevChat) => [...prevChat, ...data.messages]);

      updatePagination(setPagination, data.metadata.pages);
      return data;
    } catch (error) {
      console.error(error.message);
    } finally {
      setPagination((prev) => ({ ...prev, loading: false }));
    }
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

      setChat((prevChat) => [{ user_uuid: loggedUser.uuid, content: message }, ...prevChat]);
      setMessage("");
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
    <div className="chatContainer">
      {receiver.uuid && (
        <div className="userHeader">
          {isMobile && (
            <div
              className="chatIconContainer"
              onClick={() => {
                setDisplayChat(false);
                setDisplayChatList(true);
              }}
            >
              <img className="icon" src="arrow-left.svg" />
            </div>
          )}
          <div
            className="userHeaderPortal"
            onClick={() => {
              setUserForProfile(receiver);
              setProfileDisplay(true);
              if (isMobile) {
                setDisplayChat(false);
                setDisplayChatList(true);
              }
            }}
          >
            <img
              className="bigAvatar"
              src={receiver.avatar ? receiver.avatar : "user.svg"}
              alt={receiver.name + "'s profile picture"}
            />
            <h1>{receiver.name}</h1>
          </div>
        </div>
      )}
      <div ref={chatRef} className="msgContainer">
        {chat &&
          chat.reverse().map((message, i) => {
            if (message.user_uuid == receiver.uuid) {
              return (
                <div className="message" key={i}>
                  <img
                    className="smallAvatar"
                    src={receiver.avatar}
                    alt={receiver.name + "'s profile picture"}
                  />
                  <p>{message.content}</p>
                </div>
              );
            } else {
              return (
                <div className="message pushRight" key={i}>
                  <p>{message.content}</p>
                  <img
                    className="smallAvatar"
                    src={loggedUser.avatar}
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
          />
          <div className="chatIconContainer">
            <img className="icon" src="send.svg" alt="A send icon" onClick={(e) => sendMessage(e, message)} />
          </div>
        </form>
      )}
    </div>
  );
}
