describe "ChatsController", type: :request do
  include ChatFinder

  before do
    allow_any_instance_of(Api::V1::ChatsController)
      .to receive(:current_user)
      .and_return(User.first)
  end

  it "doesn't create a chat if receiver uuid is missing" do
    post "/api/v1/chats/open", params: { chat: { receiver_uuids: nil } }
    expect(response).to have_http_status(422)
  end

  it "creates a chat if it doesn't exist already" do
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

    expect {
      post "/api/v1/chats/open", params: { chat: { receiver_uuids: [ receiver.uuid ] } }
    }.to change(Chat, :count).by(1)

    expect(response).to have_http_status(:ok)
  end

  it "finds chat if it already exists and returns messages" do
    receiver = User.create(name: "test", email: "test@mail.com", password: "123123")

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
end
