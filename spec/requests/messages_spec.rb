require 'rails_helper'

RSpec.describe "Messages", type: :request do
  def sign_in(user)
    post user_session_path, params: {
      user: {
        email: user.email,
        password: user.password
      }
    }
  end

  it "fails creation if receiver uuid is missing" do
    user1 = create(:user)
    sign_in(user1)

    user2 = create(:user, email: "dave2@mail.com")

    # create a chat between the two users
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }

    post "/api/v1/messages/send", params: { message: { content: "hello", receiver_uuid: nil } }

    expect(response).to have_http_status(:not_found)
  end

  it "fails creation if chat doesn't exist" do
    user1 = create(:user)
    sign_in(user1)

    user2 = create(:user, email: "dave2@mail.com")

    post "/api/v1/messages/send", params: { message: { content: "hello", receiver_uuid: user2.uuid } }

    expect(response).to have_http_status(:not_found)
  end

  it "fails creation if content is missing" do
    user1 = create(:user)
    sign_in(user1)

    user2 = create(:user, email: "dave2@mail.com")

    # create a chat between the two users
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }

    post "/api/v1/messages/send", params: { message: { content: nil, receiver_uuid: user2.uuid } }

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "creates a message when params are provided" do
    user1 = create(:user)
    sign_in(user1)

    user2 = create(:user, email: "dave2@mail.com")

    # create a chat between the two users
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }

    post "/api/v1/messages/send", params: { message: { content: "hello", receiver_uuid: user2.uuid } }

    expect(Chat.first.messages.first.content).to include("hello")
  end
end
