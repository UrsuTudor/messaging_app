import React, { useEffect, useState, useRef, useMemo } from "react";
import "../assets/stylesheets/userList.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom } from "../assets/helpers";
import debounce from "lodash.debounce";

export default function UserList({ setReceiver, setProfile, setDisplayChat }) {
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
      setNewElements(`/api/v1/users/list?page=${pagination.page}`, "users", setUserList, setPagination);
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

  function searchUsers(search) {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    setNewElements(
      `/api/v1/users/list?page=1&search=${search}`,
      "users",
      setUserList,
      setPagination,
      true
    );
  }

  const debouncedSearch = useMemo(() => debounce((search) => searchUsers(search), 300));

  return (
    <div className={isMobile ? "userListContainer mobileList" : "userListContainer"}>
      <div className="listHeader">
        <h1> Users</h1>
        <input
          className="searchBar"
          type="text"
          placeholder="Search for a user"
          onChange={(e) => {
            debouncedSearch(e.target.value);
          }}
        />
      </div>

      <div className="userList" ref={userListRef} data-testid="userList">
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
              setProfile({ display: false, user: null });

              if (isMobile) {
                setDisplayChat({ chat: true, chatList: false });
              }
            }}
            onMouseEnter={() => {
              if (!isMobile) {
                setProfile({ display: true, user: user });
              }
            }}
            onMouseLeave={() => {
              setProfile({ display: false, user: null });
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
    </div>
  );
}
