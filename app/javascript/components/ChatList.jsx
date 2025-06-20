import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/chatList";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom } from "../assets/helpers";
import UserList from "./UserList";

export default function ChatList({
  setReceiver,
  setProfileDisplay,
  setDisplayChat,
  setDisplayChatList,
  setUserForProfile,
  refetchChatList,
  setRefetchChatList,
}) {
  const [chatList, setChatList] = useState([]);
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const chatListRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;

  useEffect(() => {
    setPagination((prevPagination) => ({ ...prevPagination, page: 1 }));
    setChatList([]);

    if (refetchChatList == true) {
      setNewElements(
        `/api/v1/users/chats?page=${1}`,
        "chat_users",
        setChatList,
        setPagination,
        pagination.page
      );
    }
    
    setRefetchChatList(false);
  }, [refetchChatList]);

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = chatListRef.current.scrollHeight * 0.1;

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      setNewElements(
        `/api/v1/users/chats?page=${pagination.page}`,
        "chat_users",
        setChatList,
        setPagination,
        pagination.page
      );
    }
  }, [scrollBottom]);

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

  return (
    <div className="chatListContainer">
      <h1>Chats</h1>
      <div ref={chatListRef} className={isMobile ? "chatList mobileList" : "chatList"} data-testid="chatList">
        {chatList.map((user) => (
          <button
            key={user.uuid}
            className="userContainer"
            onClick={() => {
              setProfileDisplay(false);
              setReceiver({
                avatar: user.avatar,
                name: user.name,
                uuid: user.uuid,
                description: user.description,
              });
              if (isMobile) {
                setDisplayChat(true);
                setDisplayChatList(false);
              }
            }}
            data-testid="chatListBtn"
          >
            <div className="userHeader">
              <img
                className="smallAvatar"
                src={user.avatar ? user.avatar : "user.svg"}
                alt={user.name + "'s profile picture"}
              />
              <h4 className="userName">{user.name}</h4>
            </div>
          </button>
        ))}
      </div>
      {isMobile && (
        <>
          <UserList
            setReceiver={setReceiver}
            setProfileDisplay={setProfileDisplay}
            setUserForProfile={setUserForProfile}
            setDisplayChat={setDisplayChat}
            setDisplayChatList={setDisplayChatList}
          />
        </>
      )}
    </div>
  );
}
