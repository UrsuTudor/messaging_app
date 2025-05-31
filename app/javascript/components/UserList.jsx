import React, { useEffect, useState, useRef } from "react";
import "../assets/stylesheets/userList.css";
import useThrottle from "../helpers";

export default function UserList({ setReceiver }) {
  const [userList, setUserList] = useState([]);
  const [scrollBottom, setScrollBottom] = useState(0);
  const [pagination, setPagination] = useState({
    endMessage: null,
    page: 1,
    pages: 2,
    loading: false,
  });
  const userListRef = useRef(null);
  const throttle = useThrottle();

  useEffect(() => {
    if (pagination.page > pagination.pages) {
      setPagination((prev) => ({ ...prev, endMessage: "You have reached the end!" }));
      return;
    }

    async function getUsers() {
      try {
        setPagination(prev => ({...prev, loading: true}));
        const res = await fetch(`/api/v1/users/list?page=${pagination.page}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error(`The list of users could not be retrieved.`);
        }

        const data = await res.json();
        setUserList((prevUsers) => [...prevUsers, ...data.users]);
        setPagination((prev) => ({ ...prev, page: prev.page + 1, pages: data.metadata.pages }));

        return data;
      } catch (error) {
        console.error(error.message);
      } finally {
        setPagination(prev => ({...prev, loading: false}));
      }
    }

    const scrollThreshold = userListRef.current.scrollHeight * 0.1

    if (scrollBottom < scrollThreshold && !pagination.loading) {
      getUsers();
    }
  }, [scrollBottom]);

  useEffect(() => {
    const updatePosition = () => {
      setScrollBottom(
        userListRef.current.scrollHeight - userListRef.current.scrollTop - userListRef.current.clientHeight
      );
    };
    userListRef.current.addEventListener("scroll", () => throttle(updatePosition, 50));

    return () => userListRef.current.removeEventListener("scroll", updatePosition());
  }, []);

  return (
    <div ref={userListRef} className="userListContainer">
      {userList.map((user) => (
        <div
          key={user.uuid}
          className="userContainer"
          onClick={() =>
            setReceiver({
              avatar: user.avatar,
              name: user.name,
              uuid: user.uuid,
            })
          }
        >
          <div className="userHeader">
            <img className="smallAvatar" src={user.avatar} alt={user.name + "'s profile picture"} />
            <h4 className="userName">{user.name}</h4>
          </div>
        </div>
      ))}
      {pagination.endMessage && <p>{pagination.endMessage}</p>}
    </div>
  );
}
