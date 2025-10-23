require "rails_helper"
include ChatFinder

describe "UsersController", type: :request do
  before do
    allow_any_instance_of(Api::V1::UsersController)
    .to receive(:current_user)
    .and_return(User.first)
  end



  it "fails creation if name is missing" do
    post "/users",
      params: { user: { email: "test@mail.com", password: "123" } },
      headers: { "ACCEPT" => "application/json" }

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "assigns a uuid when the user is created" do
    user = User.create!(name: "Test", email: "test@mail.com", password: "password")
    expect(user.uuid).to be_present
  end

  it "return an array of users with pagination, skipping current_user" do
    logged_user = User.first

    get "/api/v1/users/list?page=1"
    expect(JSON.parse(response.body)["users"]).not_to include(logged_user)

    get "/api/v1/users/list?page=2"
    expect(JSON.parse(response.body)["users"].length).to be(20)
  end

  it "returns a paginated array of user data of the users the current_user has a chat with" do
    receiver = User.find_by(name: "Dave2")
    chat = find_private_chat(receiver.id, User.first.id)

    post "/api/v1/messages/send", params: { message: { content: "Hello", receiver_uuids: [ receiver.uuid ], chat_id: chat.id } }

    get "/api/v1/users/chats?page=1"
    first_data_set = JSON.parse(response.body)["chat_users"]
    expect(first_data_set.length).to be(20)
    expect(first_data_set[0][0]["uuid"]).to eq(receiver.uuid)
  end

  it "returns logged user info" do
    get "/api/v1/users/current"
    user_data = JSON.parse(response.body)

    expect(user_data["name"]).to eq(User.first.name)
    expect(user_data["description"]).to eq(User.first.description)
    expect(user_data["uuid"]).to eq(User.first.uuid)
    expect(user_data["avatar"]).to eq(url_for(User.first.avatar))
  end
end
