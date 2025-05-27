import React, { useEffect, useState } from "react";

export default function ChatList({setReceiver}) {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    async function getChats() {
      try {
        const res = await fetch("/api/v1/users/chats", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error(`The list of chats could not be retrieved.`);
        }

        const data = await res.json();
        setChatList(data.chat_users);
      } catch (error) {
        console.error(error.message);
      }
    }

    getChats();
  }, []);

  return (
    <div className="chatListContainer">
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
