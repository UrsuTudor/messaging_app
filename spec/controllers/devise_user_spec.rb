require "rails_helper"

describe "DeviseUsersController", type: :request do
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
end
