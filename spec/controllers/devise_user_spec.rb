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

  it "return an array of users with pagination, skipping current_user" do
    logged_user = create(:user)
    sign_in(logged_user)
    create_list(:user, 39)

    get "/api/v1/users/list?page=1"
    expect(JSON.parse(response.body)["users"]).not_to include(logged_user)

    get "/api/v1/users/list?page=2"
    expect(JSON.parse(response.body)["users"].length).to be(19)
  end

  it "returns an array of user + last message data of the users the current_user has a chat with" do
    logged_user = create(:user)
    sign_in(logged_user)
    receiver = create(:user)

    create_list(:chat, 40)

    get "/api/v1/users/chats?page=2"
    first_data_set = JSON.parse(response.body)["chat_users"]
    expect(first_data_set.length).to be(20)
    expect(first_data_set[0]["last_message"]).to eq("Hello")
    expect(first_data_set[0]["uuid"]).to eq(receiver.uuid)
  end

  it "returns logged user info" do
    user = create(:user, description: "fake user")
    user.avatar.attach(
      io: File.open(Rails.root.join('public', 'icon.png')),
      filename: "icon.png",
      content_type: "image/png"
    )

    sign_in(user)

    get "/api/v1/users/current"
    user_data = JSON.parse(response.body)

    expect(user_data["name"]).to eq(user.name)
    expect(user_data["description"]).to eq(user.description)
    expect(user_data["uuid"]).to eq(user.uuid)
    expect(user_data["avatar"]).to eq(url_for(user.avatar))
  end
end
