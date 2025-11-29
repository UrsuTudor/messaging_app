require "rails_helper"
include ChatFinder

describe "UsersController", type: :request do
  before do
    create_list(:user, 60)

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
    create_list(:chat, 25, users: [ User.first, User.second, User.third ])

    get "/api/v1/users/chats?page=1"
    first_data_set = JSON.parse(response.body)["chat_users"]
    expect(first_data_set.length).to be(20)
  end

  it "returns logged user info" do
    User.first.avatar.attach(
      io: StringIO.new("fake image data"),
      filename: "avatar.png",
      content_type: "image/png"
    )

    get "/api/v1/users/current"
    user_data = JSON.parse(response.body)

    expect(user_data["name"]).to eq(User.first.name)
    expect(user_data["description"]).to eq(User.first.description)
    expect(user_data["uuid"]).to eq(User.first.uuid)
    expect(user_data["avatar"]).to eq(url_for(User.first.avatar))
  end

  describe "returns current_user event data" do
    before do
      create_list(:event, 3, organisers: [ User.second ])
      create(:event_membership, event: Event.first, user: User.first, status: "pending")
      create(:event_membership, event: Event.second, user: User.first)
      create(:event_membership, event: Event.second, user: User.first, status: "declined")
    end

    it "only returns data of accepted or pending events" do
      get "/api/v1/users/current"
      user_data = JSON.parse(response.body)

      expect(user_data["events"].length).to be(2)
      expect(user_data["events"][0]["id"]).to be(Event.first.id)
      expect(user_data["events"][1]["id"]).to be(Event.second.id)
    end

    it "only returns pending event requests" do
      get "/api/v1/users/current"
      user_data = JSON.parse(response.body)

      expect(user_data["pending_requests"].length).to be(1)
      expect(user_data["pending_requests"][0]).to be(Event.first.id)
    end
  end
end
