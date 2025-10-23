require 'rails_helper'
include ChatFinder

RSpec.describe "Messages", type: :request do
  before do
    allow_any_instance_of(Api::V1::ChatsController)
      .to receive(:current_user)
      .and_return(User.first)

    allow_any_instance_of(Api::V1::MessagesController)
      .to receive(:current_user)
      .and_return(User.first)
  end

  it "fails creation if receiver uuid is missing" do
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

    # create a chat between the two users
    post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }

    post "/api/v1/messages/send", params: { message: { content: "hello", receiver_uuids: nil } }

    expect(response).to have_http_status(:not_found)
  end

  it "fails creation if chat doesn't exist" do
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

    post "/api/v1/messages/send", params: { message: { content: "hello", receiver_uuids: [ receiver.uuid ], chat_id: 543 } }

    expect(response).to have_http_status(:not_found)
  end

  it "fails creation if content is missing" do
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

    # create a chat between the two users
    post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }
    chat = find_private_chat(User.first.id, receiver.id)

    post "/api/v1/messages/send", params: { message: { content: nil, receiver_uuids: [ receiver.uuid ], chat_id: chat.id } }

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "creates a message when params are provided" do
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

    post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }
    chat = find_private_chat(receiver.id, User.first.id)

    post "/api/v1/messages/send", params: { message: { content: "Hello", receiver_uuids: [ receiver.uuid ], chat_id: chat.id } }

    expect(chat.messages.first.content).to include("Hello")
  end
end
