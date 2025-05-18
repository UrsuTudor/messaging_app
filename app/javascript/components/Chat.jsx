import React, { useEffect, useState } from "react";

export default function Chat({receiver}) {
  const [chat, setChat] = useState(null)
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  useEffect(() => {
    async function getChat() {
      try {
        const res = await fetch("/api/v1/chats/open", {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken
            },
          body: JSON.stringify({chat: {receiver_uuid: receiver.uuid}})
        })

        if (!res.ok) {
          throw new Error(`The chat could not be opened.`);
        }

        const data = await res.json()
        setChat(data)
        return data
      } catch(error) {
        console.error(error.message)
      }
    }

    getChat()
    
  }, [receiver])

  return (
    chat && <div className="chatContainer">
      <img src={receiver.avatar} alt={receiver.name + "'s profile picture"} />
      <h1>{receiver.name}</h1>
      <div className="msgContainer">
        {chat.map((message) => {
          <div className="message">
            <img src={receiver.avatar} alt={receiver.name + "'s profile picture"} />
            <p>{message}</p>
          </div>
        })}
      </div>
    </div>

  )
}
