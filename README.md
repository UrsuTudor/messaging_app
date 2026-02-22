# Hiker's Hub, Messaging App

This is a full stack messaging/event planning app that, in concept, would be an app for hikers. The Rails backend is mostly used as an API, with the rails application layout view and the turbo:load event being used to mount the React frontend.

Past the Devise login pages, this is an SPA.

The webpage can be viewed here: https://hikers-hub.fly.dev. It uses posrgresql and fly volumes in production for ease of deployment.

## Tech Stack

- Frontend: React
- Backend: Ruby on Rails
- Database PostgreSQL

## What I would have done differently

- I would be more aware of the need for a mobile layout from the start and structure my components in a way that would make them less bloated with state. A fair amount of the state they share is state needed to display or hide child components during mobile rendering. (I have refactored my components into a setup that is cleaner since writing this.)
- I would have paid closer attention to MVC principles. Currently, my controllers are bloated with bussiness logic that should belong to the Models

## To do

- Refactor backend code to make the controllers more slim
- Write frontend tests
- Add the ability for users to be invited to events as participants, not just as organisers

## Getting Started

1. Clone the repo
2. Install dependencies
   - `npm install` (frontend)
   - `bundle install` (backend)

3. Start the app via `bin/dev`

## Features

- Fully responsive layout

- User system
  - Authentication via Devise
  - Editable profile pages with:
    - profile image
    - name and bio
    - lists of past and upcoming events the user is participating in
  - Searchable user list with lazy loading (Pagy on the backend, infinite scrolling on the frontend)

- Chat system
  - Private and group chats
  - Group member management:
    - member list
    - ability to leave group chats
  - Server-side access control ensuring only chat members can view or post messages
  - Real-time messaging and notifications using WebSockets and Redis
  - Read status tracking via a ChatMembership model
  - Searchable, lazy-loaded chat list (Pagy + infinite scrolling)

- Event system
  - Event creation with location data powered by the Google Places API
  - Event editing after creation
  - Event deletion restricted to sole organizers
  - Participant management:
    - participant list
    - users can join events or be invited as co-organizers
    - role-based permissions (organizer vs participant)
  - Server-side authorization enforcing ownership and role-based permissions
  - Searchable, lazy-loaded event list (Pagy + infinite scrolling)

## API Endpoints

### Chats
#### `POST /api/v1/chats/open?page=1`

- return a chat between the currently logged user and another user based on their uuid
- if a chat between the two does not exist, it creates and returns a new one
- uses pagination
- parameters:
  - chat: root paramater
  - receiver_uuid: type: string, required: yes, description: the uuid of the user that the logged user wants to chat with
  - page, type: int, required: yes (query param), description: page number for paginated messages

#### `POST /api/v1/chats/update_read`

- Marks the chat as read for the currently logged-in user
- Only updates if the user is a member of the chat
- Parameters:
  - chat: root parameter
  - chat_id: type: string, required: yes, description: the ID of the chat to mark as read

#### `POST /api/v1/chats/update`

- Updates a chat's details, including its name and participants
- Only allowed if the currently logged-in user is part of the chat
- Can add new users to the chat
- Parameters:
  - chat: root parameter
  - chat_id: type: string, required: yes, description: the ID of the chat to update
  - name: type: string, required: no, description: new name for the chat
  - receiver_uuids: type: array of strings, required: no, description: UUIDs of users to add to the chat

#### `DELETE /api/v1/chats/leave`

- Allows the currently logged-in user to leave a chat
- Cannot leave a chat if it only has two participants
- Returns an error if the user is not part of the chat
- Parameters:
  - chat: root parameter
  - chat_id: type: string, required: yes, description: the ID of the chat the user wants to leave

### Messages

#### `POST /api/v1/messages/send`

- Sends a message in a chat from the currently logged-in user
- Broadcasts the message via ActionCable to all chat participants
- Marks the message as unread for all receivers
- Parameters:
  - message: root parameter
  - chat_id: type: string, required: yes, description: the ID of the chat where the message will be sent
  - receiver_uuids: type: array of strings, required: yes, description: UUIDs of users who should receive the message
  - content: type: string, required: yes, description: the text content of the message

#### `POST /api/v1/messages/send`

- creates a message associated to the chat that it was sent in
- parameters:
  - message: root paramater
  - content: type: string, required: yes, description: the content of the message that the user wishes to send
  - receiver_uuid: type: string, required: yes, description: the uuid of the user receiving the message

### Users
#### `GET /api/v1/users/list`

- Returns a paginated list of users that the currently logged-in user does not already have a one-on-one chat with
- Supports searching users by name
- Parameters:
  - page: type: int, required: yes (query param), description: page number for pagination
  - search: type: string, required: no, description: search term to filter users by name

#### `GET /api/v1/users/current`

- Returns details about the currently logged-in user
- Includes name, avatar, UUID, description, events, and pending event requests
- Parameters: none

#### `POST /api/v1/users/update`

- Updates the currently logged-in user's profile information
- Returns a success message or validation errors
- Parameters:
  - user: root parameter
  - name: type: string, required: no, description: the user's new name
  - avatar: type: file, required: no, description: the user's new avatar image
  - description: type: string, required: no, description: the user's new profile description

#### `GET /api/v1/users/chats`

- Returns a paginated list of users that the currently logged-in user has chats with
- Supports searching by chat name or user name
- Includes chat metadata such as chat ID, chat name, and read status
- Parameters:
  - page: type: int, required: yes (query param), description: page number for pagination
  - search: type: string, required: no, description: search term to filter chats or user names

#### `GET /api/v1/users/group`

- Returns a list of users that the currently logged-in user has one-on-one (private) chats with
- Supports searching by user name and optional filters
- Parameters:
  - search: type: string, required: no, description: search term to filter user names
  - filters: type: object, required: no, description: optional filters for user selection

  
### Events
#### `GET /api/v1/events/participants`

- Returns a paginated list of users participating in a specific event
- Can filter participants by role
- Parameters:
  - page: type: int, required: yes (query param), description: page number for pagination
  - event_id: type: string, required: yes, description: the ID of the event
  - search: type: string, required: no, description: role to filter participants by

#### `POST /api/v1/events/participate`

- Allows a user to join an event as a participant or add organisers
- Cannot join past events
- Validates roles and existing memberships
- Parameters:
  - event_membership: root parameter
  - event_id: type: string, required: yes, description: the ID of the event to join
  - role: type: string, required: yes, description: role to join as, either "participant" or "organiser"
  - user_uuids: type: array of strings, required: no, description: UUIDs of users to add as organisers (only required if role is "organiser")

#### `POST /api/v1/events/update_membership`

- Updates the currently logged-in user's membership status for an event
- Valid replies are "accepted", "declined", or "deleted"
- Parameters:
  - event_membership: root parameter
  - event_id: type: string, required: yes, description: the ID of the event
  - reply: type: string, required: yes, description: new membership status ("accepted", "declined", or "deleted")

#### `DELETE /api/v1/events/leave_event`

- Allows the currently logged-in user to leave an event
- Cannot leave if the user is the only organiser of the event
- Returns an error if the user is not a participant
- Parameters:
  - event_membership: root parameter
  - event_id: type: string, required: yes, description: the ID of the event to leave

#### `GET /api/v1/events/all`

- Returns a paginated list of upcoming events that the currently logged-in user has not yet joined
- Supports searching by event title or location
- Parameters:
  - page: type: int, required: yes (query param), description: page number for pagination
  - search: type: string, required: no, description: search term to filter events by title or location

#### `GET /api/v1/events/locations`

- Searches for locations using the Google Places API
- Returns a list of matching locations with names and IDs
- Parameters:
  - search: type: string, required: yes, description: text query to search for locations

#### `GET /api/v1/events/:id`

- Returns detailed information about a specific event
- Includes title, description, location, organisers, participants, date, and cover image
- Parameters:
  - id: type: string, required: yes (path param), description: the ID of the event to retrieve

#### `POST /api/v1/events/create`

- Creates a new event and automatically adds the currently logged-in user as an organiser
- Returns the event ID, title, description, organisers, and date
- Parameters:
  - event: root parameter
  - title: type: string, required: yes, description: the title of the event
  - description: type: string, required: yes, description: the description of the event
  - date: type: string (ISO format), required: yes, description: the date of the event
  - location: type: string, required: yes, description: the location of the event
  - cover_image: type: file, required: no, description: optional cover image for the event

#### `POST /api/v1/events/update`

- Updates an existing event
- Only allowed if the currently logged-in user is an organiser of the event
- Returns a success message or validation errors
- Parameters:
  - event: root parameter
  - id: type: string, required: yes, description: the ID of the event to update
  - title: type: string, required: no, description: the new title of the event
  - description: type: string, required: no, description: the new description of the event
  - date: type: string (ISO format), required: no, description: the new date of the event
  - location: type: string, required: no, description: the new location of the event
  - cover_image: type: file, required: no, description: optional new cover image for the event

#### `DELETE /api/v1/events/delete`

- Deletes an existing event
- Only allowed if the currently logged-in user is the sole organiser of the event
- Parameters:
  - event: root parameter
  - id: type: string, required: yes, description: the ID of the event to delete
