require 'rails_helper'

RSpec.describe "EventMemberships", type: :request do
  let(:user1) { User.first }
  let(:user2) { User.second }
  let(:datetime) { DateTime.current }

  before do
    allow_any_instance_of(Api::V1::EventMembershipsController)
      .to receive(:current_user)
      .and_return(User.first)
  end


  describe "returns users:" do
    let(:participants) { User.limit(25).to_a }
    let(:event) { create(:event, organisers: [ User.last, User.second_to_last ], participants: participants) }

    it "returns a list of organisers" do
      get "/api/v1/events/participants?search=organiser", params: { event_membership: { event_id: event.id } }

      organisers =  JSON.parse(response.body)["users"]
      expect(organisers.length).to be(2)
      expect(organisers[0]["uuid"]).to match(User.last.uuid)
      expect(organisers[1]["uuid"]).to match(User.second_to_last.uuid)
    end

    it "returns a paginated list of participants" do
      get "/api/v1/events/participants?page=1&search=participant", params: { event_membership: { event_id: event.id } }

      first_page =  JSON.parse(response.body)["users"]
      expect(first_page.length).to be(20)
      expect(first_page[0]["uuid"]).to match(participants[0].uuid)
      expect(first_page[19]["uuid"]).to match(participants[19].uuid)

      get "/api/v1/events/participants?page=2&search=participant", params: { event_membership: { event_id: event.id } }

      second_page =  JSON.parse(response.body)["users"]
      expect(second_page.length).to be(5)
      expect(second_page[0]["uuid"]).to match(participants[20].uuid)
      expect(second_page[4]["uuid"]).to match(participants[24].uuid)
    end
  end

  describe "handles participant addition:" do
    let(:event_not_organized_by_current_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user2 ]) }
    let(:event_organized_by_current_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user1 ]) }

    it "adds a participant when event_id is provided" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }

      expect(response).to have_http_status(:ok)

      event = Event.find(event_not_organized_by_current_user.id)

      expect(event.event_memberships.exists?(user_id: user1, role: "participant")).to be(true)
    end

    it "doesn't add a participant if the participant is also an organizer" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_organized_by_current_user.id } }

      expect(event_organized_by_current_user.event_memberships.exists?(user_id: user1, role: "organiser")).to be(true)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to match("You are already a participant")
    end

    it "doesn't add a participant if the participant is also an organizer" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to match("You are already a participant")
    end

    it "doesn't add a participant if the event has already passed" do
      event_not_organized_by_current_user.update!(date: DateTime.current)

      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to match("Cannot join a past event")
    end
  end

  describe "handles participant removal" do
    let(:event_not_organized_by_current_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user2 ]) }
    let(:event_organized_by_current_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user1 ]) }

    it "removes participant" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }

      expect(event_not_organized_by_current_user.event_memberships.count).to be(2)

      delete "/api/v1/events/leave_event", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }
      expect(event_not_organized_by_current_user.event_memberships.count).to be(1)
    end

    it "safely errors if the person trying to remove themselves from the event weren't a member to being with" do
      delete "/api/v1/events/leave_event", params: { event_membership: { event_id: event_not_organized_by_current_user.id } }

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)["error"]).to match("You are not a participant of this event")
    end

    it "doesn't remove participant if they are the last organizer of the event" do
      delete "/api/v1/events/leave_event", params: { event_membership: { event_id: event_organized_by_current_user.id } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["error"]).to match("You are the only organiser of this event")
    end
  end
end
