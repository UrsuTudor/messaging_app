describe "ChatsController", type: :request do
  include ChatFinder

  def sign_in(user)
    post user_session_path, params: {
      user: {
        email: user.email,
        password: user.password
      }
    }
  end

  it "doesn't create a chat if receiver uuid is missing" do
    user1 = create(:user)
    sign_in(user1)

    post "/api/v1/chats/open", params: { chat: { receiver_uuid: nil } }

    # receiver is not being found
    expect(response).to have_http_status(:not_found)
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
    chat = find_chat(user1.id, user2.id)
    create(:message, chat: chat, content: "first message", user: user1)
    create(:message, chat: chat, content: "second message", user: user2)

    # finding the chat
    post "/api/v1/chats/open", params: { chat: { receiver_uuid: user2.uuid } }
    # puts JSON.parse(response.body[0])
    expect(JSON.parse(response.body)['messages'][1]['content']).to include("first message")
    expect(JSON.parse(response.body)['messages'][0]['content']).to include("second message")
  end
end
