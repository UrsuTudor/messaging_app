import React, { useEffect, useState } from "react";

export default function UserList({setReceiver}) {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    async function getUsers() {
      try {
        const res = await fetch("/api/v1/users/list", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error(`The list of users could not be retrieved.`);
        }

        const data = await res.json();
        setUserList(data);
        return data;
      } catch (error) {
        console.error(error.message);
      }
    }

    getUsers();
  }, []);

  return (
    <div>
      {userList.map((user) => (
        <div key={user.uuid} className="userContainer" onClick={() => setReceiver({avatar: user.avatar, name: user.name, uuid: user.uuid})}>
          <img src={user.avatar} alt={user.name + "'s profile picture"} />
          <p>{user.name}</p>
        </div>
      ))}
    </div>
  );
}
