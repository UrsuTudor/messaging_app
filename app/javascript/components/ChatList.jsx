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
        console.log(data)
        setChatList(data.chat_users);
      } catch (error) {
        console.error(error.message);
      }
    }

    getChats();
  }, []);

  return (
    <div>
      {chatList.map((user) => (
        <div key={user.uuid} className="userContainer" onClick={() => setReceiver({avatar: user.avatar, name: user.name, uuid: user.uuid})}>
          <img src={user.avatar} alt={user.name + "'s profile picture"} />
          <p>{user.name}</p>
          <p>{user.last_message}</p>
        </div>
      ))}
    </div>
  );
}
