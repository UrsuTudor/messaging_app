require 'rails_helper'

RSpec.describe "ChatMembershipsController", type: :request do
  let(:current_user) { create(:user, email: "current@mail.com") }
  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:current_user)
      .and_return(current_user)
  end
  describe "DELETE /destroy" do
    let(:users) { create_list(:user, 2) }
    it "deletes a membership if all conditions are met" do
      chat = create(:chat, users: [ current_user, *users ])
      expect(chat.chat_memberships.count).to be(3)

      expect {
        delete "/api/v1/chats/leave", params: { chat_membership: { chat_id: chat.id } }
      }.to change(ChatMembership, :count).by(-1)

      chat = Chat.find_by(id: chat.id)

      expect(chat.chat_memberships.count).to be(2)
    end

    it "errors if the chat doesn't have more than 2 users" do
      chat = create(:chat, users: [ current_user, create(:user) ])

      delete "/api/v1/chats/leave", params: { chat_membership: { chat_id: chat.id } }

      expect(response).to have_http_status(:forbidden)
    end

    it "errors if the chat doesn't exist" do
      delete "/api/v1/chats/leave", params: { chat_membership: { chat_id: 437 } }

      expect(response).to have_http_status(:not_found)
    end

    it "errors if the current_user isn't a member of the chat" do
      chat = create(:chat, users: create_list(:user, 3))

      delete "/api/v1/chats/leave", params: { chat_membership: { chat_id: chat.id } }

      expect(response).to have_http_status(:not_found)
    end
  end
end
