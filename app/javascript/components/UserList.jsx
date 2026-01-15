import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/userList.css";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom, handleResize } from "../assets/helpers";
import SearchBar from "./SearchBar";

export default function UserList({ listToShow = [], setMainDisplay }) {
  const [userList, setUserList] = useState(listToShow);
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchBar, setDisplaySearchBar] = useState(window.innerWidth > 1400);
  const userListRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;

  useEffect(() => {
    if (listToShow[0] || !searchTerm[0]) return;

    if (pagination.page > pagination.pages) {
      updateListEndMessage(setPagination);
      return;
    }

    const scrollThreshold = userListRef.current.scrollHeight * 0.1;
    if (pagination.page <= 1) setUserList([]);

    if (searchTerm && scrollBottom < scrollThreshold && !pagination.loading) {
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
        <div>
          <SearchBar
            route={`/api/v1/users/list?page=1`}
            dataKey={"users"}
            setPagination={setPagination}
            listSetter={setUserList}
            setSearchTerm={setSearchTerm}
            displaySearchBar={displaySearchBar}
            setDisplaySearchBar={setDisplaySearchBar}
            adaptable={false}
          />
        </div>
      )}

      <div
        className={searchTerm[0] || listToShow[0] ? "userList" : "userList hidden"}
        ref={userListRef}
        data-testid="userList"
      >
        {userList.map((user) => (
          <button
            key={user.uuid}
            className="userContainer"
            onClick={() => {
              setSearchTerm("");
              setMainDisplay((prev) => [
                ...prev.slice(0, -1),
                {
                  type: "chat",
                  receivers: [
                    {
                      avatar: user.avatar,
                      name: user.name,
                      uuid: user.uuid,
                      description: user.description,
                      chat_id: user.chat_id,
                    },
                  ],
                },
              ]);
            }}
            onMouseEnter={() => {
              if (!isMobile) {
                setMainDisplay((prev) => [...prev, { type: "profile", user: [user] }]);
              }
            }}
            onMouseLeave={() => {
              // I'm setting the search term to an empty string above and added this check to avoid removing the opened
              // chat; without this check, the onMouseLeave would trigger when the searchTerm is reset and the chat
              // added to the mainDisplay queue by the onClick action would be removed instead of the Profile
              if (searchTerm[0]) setMainDisplay((prev) => prev.slice(0, -1));
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
