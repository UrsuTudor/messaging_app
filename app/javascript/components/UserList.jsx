import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/userList.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom, handleResize } from "../assets/helpers";
import SearchBar from "./SearchBar";

export default function UserList({ setReceiver, setProfile, setDisplayChat, listToShow = [] }) {
  const [userList, setUserList] = useState(listToShow);
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchBar, setDisplaySearchBar] = useState(window.innerWidth > 1400);
  const userListRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;

  useEffect(() => {
    if (listToShow[0]) return;

    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = userListRef.current.scrollHeight * 0.1;
    if (pagination.page <= 1) setUserList([]);

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      setNewElements(
        `/api/v1/users/list?page=${pagination.page}&search=${searchTerm}`,
        "users",
        setUserList,
        setPagination
      );
    }
  }, [scrollBottom, searchTerm]);

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

  useEffect(() => {
    setDisplaySearchBar(window.innerWidth > 1400);

    const cleanup = handleResize(setDisplaySearchBar);
    return cleanup;
  }, []);

  return (
    <div className={isMobile ? "userListContainer mobileList" : "userListContainer"}>
      {/* for now, if I'm giving a set list to UserList, I don't want it to be searchable */}
      {!listToShow[0] && (
        <div className="listHeader">
          <h1> Users</h1>
          <SearchBar
            route={`/api/v1/users/list?page=1`}
            dataKey={"users"}
            setPagination={setPagination}
            listSetter={setUserList}
            setSearchTerm={setSearchTerm}
            displaySearchBar={displaySearchBar}
            setDisplaySearchBar={setDisplaySearchBar}
          />
        </div>
      )}

      <div className="userList" ref={userListRef} data-testid="userList">
        {userList.map((user) => (
          <button
            key={user.uuid}
            className="userContainer"
            onClick={() => {
              setReceiver([
                {
                  avatar: user.avatar,
                  name: user.name,
                  uuid: user.uuid,
                  description: user.description,
                  chat_id: user.chat_id,
                },
              ]);
              setProfile({ display: false, user: null });

              if (isMobile) {
                setDisplayChat({ chat: true, chatList: false });
              } else {
                setDisplayChat({ chat: true, chatList: true });
              }
            }}
            onMouseEnter={() => {
              if (!isMobile) {
                setProfile({ display: true, user: [user] });
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
                src={user.avatar ? user.avatar : "user_dark.svg"}
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
