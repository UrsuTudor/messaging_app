require "rails_helper"

describe "UsersController", type: :request do
  def sign_in(user)
    post user_session_path, params: {
      user: {
        email: user.email,
        password: user.password
      }
    }
  end

  it "fails creation if name is missing" do
    post "/users", params: { user: { email: "dave@mail.com", password: "dave123" } }

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "succeeds creation if name is present" do
    expect {
      post "/users", params: { user: { email: "dave@mail.com", password: "dave123", name: "Dave" } }
      puts response.body
    }.to change(User, :count).by(1)

    expect(response).to have_http_status(:see_other)
  end

  it "assigns a uuid when the user is created" do
    user = User.create!(name: "Test", email: "test@mail.com", password: "password")
    expect(user.uuid).to be_present
  end

  it "returns an array of user + last message data of the users the current_user has a chat with" do
    user1 = create(:user)
    user2 = create(:user, email: "dave2@mail.com")
    user3 = create(:user, email: "dave3@mail.com")
    sign_in(user1)

    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user3.uuid } }

    create(:message, chat: Chat.first, content: "first message", user: user1)
    create(:message, chat: Chat.second, content: "second message", user: user2)

    get "/api/v1/users/chats"
    chat_users = JSON.parse(response.body)["chat_users"]

    expect(chat_users.map { |user| user["last_message"] }).to include("first message", "second message")
  end
end
