require 'rails_helper'
include ChatFinder

RSpec.describe "Messages", type: :request do
  let(:user1) { create(:user) }

  before do
    allow_any_instance_of(Api::V1::ChatsController)
        .to receive(:current_user)
        .and_return(user1)

      allow_any_instance_of(Api::V1::MessagesController)
        .to receive(:current_user)
        .and_return(user1)
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

  describe "group chat messaging" do
    before do
      receiver1 = User.create(name: "test", email: "test@mail.com", password: "123123")
      receiver2 = User.create(name: "test", email: "test2@mail.com", password: "123123")
      receiver3 = User.create(name: "test", email: "test3@mail.com", password: "123123")

      expect {
        post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver1.uuid, receiver2.uuid, receiver3.uuid ] } }
      }.to change(Chat, :count).by(1)
    end
    it "sends messages to group chat" do
      newly_created_chat = Chat.last
      chat_users = newly_created_chat.users

      post "/api/v1/messages/send", params: { message: { content: "Hello",
                                                         receiver_uuids: [ chat_users[1].uuid,
                                                                           chat_users[2].uuid,
                                                                           chat_users[3].uuid ],
                                                         chat_id: newly_created_chat.id } }

      expect(newly_created_chat.messages.count).to be(1)
    end

    it "doesn't accidentally send messages to other existing chats" do
      newly_created_chat = Chat.last
      chat_users = newly_created_chat.users

      expect {
        post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ chat_users[1].uuid ] } }
      }.to change(Chat, :count).by(1)

      private_chat = Chat.last

      post "/api/v1/messages/send", params: { message: { content: "Hello",
                                                         receiver_uuids: [ chat_users[1].uuid,
                                                                           chat_users[2].uuid,
                                                                           chat_users[3].uuid ],
                                                         chat_id: newly_created_chat.id } }

      expect(newly_created_chat.messages.count).to be(1)
      expect(private_chat.messages.count).to be(0)
    end
  end
end
