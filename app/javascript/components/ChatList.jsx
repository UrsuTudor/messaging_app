import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/chatList"
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom } from "../assets/helpers";

export default function ChatList({setReceiver}) {
  const [chatList, setChatList] = useState([]);
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const chatListRef = useRef(null);
  const throttle = useThrottle();

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = chatListRef.current.scrollHeight * 0.1;

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      setNewElements(`/api/v1/users/chats?page=${pagination.page}`, "chat_users", setChatList, setPagination);
    }
  }, [scrollBottom]);

  useEffect(() => {
    const throttledUpdateScrollBottom = () => throttle(() => updateScrollBottom(setScrollBottom, chatListRef.current), 50)
    chatListRef.current.addEventListener("scroll", throttledUpdateScrollBottom)

    return () => chatListRef.current.removeEventListener("scroll", throttledUpdateScrollBottom);
  }, []);

  return (
    <div ref={chatListRef} className="chatListContainer">
      {chatList.map((user) => (
        <div key={user.uuid} className="userContainer" onClick={() => setReceiver({avatar: user.avatar, name: user.name, uuid: user.uuid})}>
          <div className="userHeader">
            <img className="smallAvatar" src={user.avatar} alt={user.name + "'s profile picture"} />
            <h4 className="userName">{user.name}</h4>
          </div>
          <p>{user.last_message}</p>
        </div>
      ))}
    </div>
  );
}
