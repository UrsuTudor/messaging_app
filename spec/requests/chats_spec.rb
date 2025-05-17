describe "ChatsController", type: :request do
  def sign_in(user)
    post user_session_path, params: {
      user: {
        email: user.email,
        password: user.password
      }
    }
  end

  it "creates a chat if it doesn't exist already" do
    user1 = create(:user)
    sign_in(user1)

    user2 = create(:user, email: "dave2@mail.com")

    expect {
      post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }
    }.to change(Chat, :count).by(1)
    expect(response).to have_http_status(:ok)
  end

  it "finds chat if it already exists and returns messages" do
    user1 = create(:user)
    sign_in(user1)

    user2 = create(:user, email: "dave2@mail.com")

    # creating a chat and assigning a message to it for verification
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }
    chat = Chat.first
    create(:message, chat: chat, content: "first message", user: user1)
    create(:message, chat: chat, content: "second message", user: user2)

    # finding the chat
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }
    expect(JSON.parse(response.body)[0]['content']).to include("first message")
    expect(JSON.parse(response.body)[1]['content']).to include("second message")
  end
end
