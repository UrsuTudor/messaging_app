import React, {useState} from "react"

export default function Profile({user}){
  const [renderDescriptionForm, setRenderDescriptionForm] = useState(false)
  const [description, setDescription] = useState(user.description)
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  async function updateDescription(e){
    e.preventDefault()
    try {
      const res = await fetch("/api/v1/users/update", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({user: {description: description}})
      })

      const data = await res.json()
      console.log(data)
    } catch(error) {
      console.error(error.message)
    }
  }

  return(
    <div className="userProfile">
      <img src={user.avatar} alt={user.name + "'s profile picture"} />
      <h1>{user.name}</h1>
      {renderDescriptionForm ? 
        <form onSubmit={updateDescription}>
          <label htmlFor="description">
            <input type="text" id="description" value={user.description} onChange={(e) => setDescription(e.target.value)}/>
          </label>
        </form>
       : <p>{description}</p>}
      <button onClick={() => setRenderDescriptionForm(true)}>Edit description</button>
    </div>
  )
}
