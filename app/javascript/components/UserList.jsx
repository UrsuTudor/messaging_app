import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/userList.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom } from "../assets/helpers";

export default function UserList({
  setReceiver,
  setProfileDisplay,
  setUserForProfile,
  setDisplayChat,
  setDisplayChatList,
}) {
  const [userList, setUserList] = useState([]);
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const userListRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = userListRef.current.scrollHeight * 0.1;

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      setNewElements(`/api/v1/users/list?page=${pagination.page}`, "users", setUserList, setPagination, pagination.page)
    }
  }, [scrollBottom]);

  useEffect(() => {
    const throttledUpdateScrollBottom = () =>
      throttle(() => updateScrollBottom(setScrollBottom, userListRef.current), 50);
    userListRef.current.addEventListener("scroll", throttledUpdateScrollBottom);

    return () => {
      if (userListRef.current) {
        userListRef.current.removeEventListener("scroll", throttledUpdateScrollBottom);
      }
    };
  }, []);

  return (
    <div ref={userListRef} className="userListContainer" data-testid="userList">
      {userList.map((user) => (
        <button
          key={user.uuid}
          className="userContainer"
          onClick={() => {
            setReceiver({
              avatar: user.avatar,
              name: user.name,
              description: user.description,
              uuid: user.uuid,
            });
            setProfileDisplay(false);

            if (isMobile) {
              setDisplayChat(true);
              setDisplayChatList(false);
            }
          }}
          onMouseEnter={() => {
            if (!isMobile) {
              setProfileDisplay(true);
              setUserForProfile(user);
            }
          }}
          onMouseLeave={() => {
            setProfileDisplay(false);
            setUserForProfile(null);
          }}

          data-testid="userListBtn"
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
      {pagination.endMessage && <p>{pagination.endMessage}</p>}
    </div>
  );
}
