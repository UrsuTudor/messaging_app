import React, { useEffect, useState } from "react";

export default function Chat({receiver}) {
  const [chat, setChat] = useState(null)
  const [message, setMessage] = useState("")
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

  async function sendMessage(e, message){
    e.preventDefault()
    try {
      const res = await fetch("/api/v1/messages/send", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({message: {content: message, receiver_uuid: receiver.uuid}})
      })

      if (!res.ok) {
        throw new Error(`The message could not be sent.`);
      }

      setMessage('')

    } catch(error) {
      console.error(error.message)
    }
  }

  return (
    chat && <div className="chatContainer">
      <img src={receiver.avatar} alt={receiver.name + "'s profile picture"} />
      <h1>{receiver.name}</h1>
      <div className="msgContainer">
        {chat.map((message) => {
          return (
            <div className="message" key={message.id}>
              <img src={receiver.avatar} alt={receiver.name + "'s profile picture"} />
              <p>{message.content}</p>
            </div>
          )
        })}
      </div>
      <form className="messageForm" onSubmit={(e) => sendMessage(e, message)}>
        <label htmlFor="message">
          <input
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
      </form>
    </div>
  )
}
