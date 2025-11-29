require 'rails_helper'

RSpec.describe "EventMemberships", type: :request do
  let(:user1) { create(:user, email: "testmail@test.com") }
  let(:user2) { create(:user, email: "testmail2@test.com") }
  let(:event_not_organized_by_current_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user2 ]) }
  let(:event) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user1 ]) }

  before do
    create_list(:user, 30)

    allow_any_instance_of(Api::V1::EventMembershipsController)
      .to receive(:current_user)
      .and_return(user1)
  end

  describe "returns users:" do
    let(:participants) { User.limit(25).to_a }
    let(:event) { create(:event, organisers: [ user1, user2 ], participants: participants) }

    it "returns a list of organisers" do
      get "/api/v1/events/participants?search=organiser", params: { event_membership: { event_id: event.id } }

      organisers =  JSON.parse(response.body)["users"]
      expect(organisers.length).to be(2)
      expect(organisers[0]["uuid"]).to match(user1.uuid)
      expect(organisers[1]["uuid"]).to match(user2.uuid)
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
    it "adds a participant when event_id is provided" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id, role: "participant" } }

      expect(response).to have_http_status(:ok)

      event = Event.find(event_not_organized_by_current_user.id)

      expect(event.event_memberships.exists?(user_id: user1, role: "participant", status: "accepted")).to be(true)
    end

    it "doesn't add a participant if the participant is also an organizer" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event.id, role: "participant" } }

      expect(user1.event_memberships.exists?(user_id: user1, role: "organiser")).to be(true)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to match("User is already a participant")
    end

    it "doesn't add a participant if the participant is already a participant" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id, role: "participant" } }
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id, role: "participant" } }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to match("User is already a participant")
    end

    it "doesn't add a participant if the event has already passed" do
      event_not_organized_by_current_user.update!(date: DateTime.current)

      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id, role: "participant" } }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to match("Cannot join past events")
    end
  end

  describe "handles participant removal" do
    let(:event_not_organized_by_current_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user2 ]) }
    let(:event_user) { Event.create!(title: "Bear Event", date: DateTime.tomorrow, organisers: [ user1 ]) }

    it "removes participant" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id, role: "participant" } }

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
      delete "/api/v1/events/leave_event", params: { event_membership: { event_id: event_user.id } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["error"]).to match("You are the only organiser of this event")
    end
  end

  describe "handles organiser addition" do
    it "creates a pending request when the role param is organiser" do
      expect {
        post "/api/v1/events/participate", params: { event_membership: { event_id: event.id, role: "organiser", user_uuids: [ user2.uuid ] } }
      }.to change { event.event_memberships.count }.by(1)

      expect(event.event_memberships.last.user_id).to be(user2.id)
      expect(event.event_memberships.last.status).to match("pending")
    end

    it "creates multiple request when the role param is organiser" do
      user3 = create(:user, email: "testmail3@test.com")
      user4 = create(:user, email: "testmail4@test.com")

      expect {
        post "/api/v1/events/participate", params: { event_membership: { event_id: event.id, role: "organiser", user_uuids: [ user2.uuid, user3.uuid, user4.uuid ] } }
      }.to change { event.event_memberships.count }.by(3)

      expect(event.event_memberships.last.user_id).to be(user4.id)
      expect(event.event_memberships.last.status).to match("pending")
    end

    it "skips a uuid if the user is already an organiser" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event.id, role: "organiser", user_uuids: [ user2.uuid ] } }

      expect {
        post "/api/v1/events/participate", params: { event_membership: { event_id: event.id, role: "organiser", user_uuids: [ user2.uuid ] } }
      }.not_to change { event.event_memberships.count }
    end

    it "forbids the operation if the current_user is not an organiser of the event" do
      post "/api/v1/events/participate", params: { event_membership: { event_id: event_not_organized_by_current_user.id, role: "organiser", user_uuids: [ user1.uuid ] } }

      expect(response.status).to be(403)
    end

    it "updates an existing participant membership to a pending organiser one" do
      membership = create(:event_membership, user: user2, event: event)
      expect(membership.status).to match("accepted")
      expect(membership.role).to match("participant")

      post "/api/v1/events/participate", params: { event_membership: { event_id: event.id, role: "organiser", user_uuids: [ user2.uuid ] } }

      updated_membership = EventMembership.find_by(user_id: user2.id, event_id: event.id)
      expect(updated_membership.status).to match("pending")
      expect(updated_membership.role).to match("organiser")
    end

    it "accepts a sent request" do
      create(:event_membership, event: event, user: user2, role: "organiser", status: "pending")

      post "/api/v1/events/reply_to_invite", params: { event_membership: { event_id: event.id, reply: "accept" } }

      membership = EventMembership.find_by(event_id: event.id, user_id: user1.id)
      expect(membership.status).to match("accepted")
    end

    it "declines a sent request" do
      create(:event_membership, event: event, user: user2, role: "organiser", status: "pending")

      post "/api/v1/events/reply_to_invite", params: { event_membership: { event_id: event.id, reply: "decline" } }

      membership = EventMembership.find_by(event_id: event.id, user_id: user1.id)
      expect(membership.status).to match("declined")
    end

    it "sets the status of a request as deleted" do
      create(:event_membership, event: event, user: user2, role: "organiser", status: "accepted")

      post "/api/v1/events/reply_to_invite", params: { event_membership: { event_id: event.id, reply: "delete" } }

      membership = EventMembership.find_by(event_id: event.id, user_id: user1.id)
      expect(membership.status).to match("deleted")
    end

    it "fails if reply doesn't match expected input" do
      create(:event_membership, event: event, user: user2, role: "organiser", status: "pending")

      post "/api/v1/events/reply_to_invite", params: { event_membership: { event_id: event.id, reply: "fail" } }

      expect(response.status).to be(422)
    end

    it "fails if the event id provided doesn't match any event" do
      create(:event_membership, event: event, user: user2, role: "organiser", status: "pending")

      post "/api/v1/events/reply_to_invite", params: { event_membership: { event_id: Event.last.id + 1, reply: "accept" } }

      expect(response.status).to be(404)
    end

     it "fails if event exists, but the user isn't a member" do
      post "/api/v1/events/reply_to_invite", params: { event_membership: { event_id: event_not_organized_by_current_user.id, reply: "decline" } }

      expect(response.status).to be(404)
    end
  end
end
