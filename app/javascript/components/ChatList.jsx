import React, { useEffect, useRef } from "react";
import "../assets/stylesheets/chatList";
import useThrottle from "../assets/hooks/useThrottle";
import usePagination from "../assets/hooks/usePagination";
import useScrolling from "../assets/hooks/useScrolling";
import { setNewElements, updateListEndMessage, updateScrollBottom } from "../assets/helpers";
import UserList from "./UserList";
import SearchBar from "./SearchBar";
import consumer from "../channels/consumer";

export default function ChatList({ setReceiver, setProfile, setDisplayChat, chatList, setChatList }) {
  const [scrollBottom, setScrollBottom] = useScrolling();
  const [pagination, setPagination] = usePagination();
  const chatListRef = useRef(null);
  const throttle = useThrottle();
  const isMobile = window.innerWidth < 700;

  consumer.subscriptions.create(
    { channel: "ChatListChannel" },
    {
      received() {
        setPagination((prevPagination) => ({ ...prevPagination, page: 1 }));
        setChatList([]);

        setNewElements(
          `/api/v1/users/chats?page=${1}`,
          "chat_users",
          setChatList,
          setPagination,
          pagination.page
        );
      },
    }
  );

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
      <div className="listHeader">
        <h1>Chats</h1>
        <SearchBar
          route={"api/v1/users/chats?page=1"}
          dataKey={"chat_users"}
          setPagination={setPagination}
          listSetter={setChatList}
        />
      </div>

      <div ref={chatListRef} className={isMobile ? "chatList mobileList" : "chatList"} data-testid="chatList">
        {chatList.map((user) => (
          <button
            key={user.uuid}
            className="userContainer"
            onClick={() => {
              setProfile({ display: false, user: null });
              setReceiver({
                avatar: user.avatar,
                name: user.name,
                uuid: user.uuid,
                description: user.description,
                chat_id: user.chat_id
              });
              setChatList((prev) => {
                const index = prev.findIndex((u) => u.uuid === user.uuid);

                const updated = [...prev];
                updated[index] = { ...updated[index], read: true };
                return updated;
              });
              if (isMobile) {
                setDisplayChat({ chat: true, chatList: false });
              }
            }}
            data-testid="chatListBtn"
          >
            <div className="userHeader">
              <img
                className="smallAvatar"
                src={user.avatar ? user.avatar : "user_dark.svg"}
                alt={user.name + "'s profile picture"}
              />
              <h4 className="userName">{user.name}</h4>
              {user.read ? null : (
                <img
                  className="unreadIcon"
                  src="bonfire.svg"
                  alt="A minimalistic icon reprezenting a bonfire"
                />
              )}
            </div>
          </button>
        ))}
      </div>
      {isMobile && (
        <>
          <UserList setReceiver={setReceiver} setProfile={setProfile} setDisplayChat={setDisplayChat} />
        </>
      )}
    </div>
  );
}
