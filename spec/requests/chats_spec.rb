require 'rails_helper'

describe "ChatsController", type: :request do
  include ChatFinder

  let(:current_user) { create(:user, email: "current@mail.com") }

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:current_user)
      .and_return(current_user)
  end

  it "doesn't create a chat if receiver uuid is missing" do
    post "/api/v1/chats/open", params: { chat: { receiver_uuids: nil } }
    expect(response).to have_http_status(422)
  end

  it "creates a chat if it doesn't exist already" do
    # manually creating a user because the user factory would automatically create a chat too
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

    expect {
      post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }
    }.to change(Chat, :count).by(1)

    expect(response).to have_http_status(:ok)
  end

  it "finds chat if it already exists and returns messages" do
    receiver = create(:user, email: "test@mail.com")

    # creating a chat and assigning messages to it for verification
    post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }
    chat = find_private_chat(User.first.id, receiver.id)
    create(:message, chat: chat, content: "first message", user: User.first)
    create(:message, chat: chat, content: "second message", user: receiver)

    # finding the chat
    post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }

    expect(JSON.parse(response.body)['messages'][1]['content']).to include("first message")
    expect(JSON.parse(response.body)['messages'][0]['content']).to include("second message")
  end

  it "creates a group chat if multiple receivers are provided" do
    receiver1 = create(:user, email: "test@mail.com")
    receiver2 = create(:user, email: "test2@mail.com")
    receiver3 = create(:user, email: "test3@mail.com")

    expect {
      post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver1.uuid, receiver2.uuid, receiver3.uuid ] } }
    }.to change(Chat, :count).by(1)

    newly_created_chat = Chat.last

    expect(newly_created_chat.users.first.uuid).to match(User.first.uuid)
    expect(newly_created_chat.users.second.uuid).to match(receiver1.uuid)
    expect(newly_created_chat.users.third.uuid).to match(receiver2.uuid)
    expect(newly_created_chat.users.fourth.uuid).to match(receiver3.uuid)
  end

  it "updates the chat's name" do
    receiver = create(:user, email: "test@mail.com")

    chat = create(:chat, users: [ current_user, receiver ])

    post "/api/v1/chats/update", params: { chat: { chat_id: chat.id, name: "Test Name" } }

    updated_chat = Chat.find(chat.id)
    expect(updated_chat.name).to match("Test Name")
  end

  it "adds users to a chat" do
    receiver = create(:user, email: "test@mail.com")

    chat = create(:chat, users: [ current_user, receiver ])
    expect(chat.users.count).to be(2)

    new_user = create(:user, email: "test2@mail.com")

    post "/api/v1/chats/update", params: { chat: { chat_id: chat.id, receiver_uuids: [ new_user.uuid ] } }

    updated_chat = Chat.find(chat.id)
    expect(updated_chat.users.count).to be(3)
  end
end
