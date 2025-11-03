require 'rails_helper'

RSpec.describe "Events", type: :request do
  let(:user1) { User.first }
  let(:user2) { User.second }
  let(:datetime) { DateTime.current }

  before do
    allow_any_instance_of(Api::V1::EventsController)
      .to receive(:current_user)
      .and_return(User.first)
  end

  describe "handles creation" do
    it "creates a new event when all the parameters are provided" do
      expect {
        post "/api/v1/events/create", params: { event: { title: "Bear Event", description: "Cool bear event", date: datetime, organisers: [ user1.uuid, user2.uuid ] } }
      }.to change(Event, :count).by(1)

      event = JSON.parse(response.body)
      json_date = DateTime.parse(event["date"])

      expect(event["title"]).to match("Bear Event")
      expect(event["description"]).to match("Cool bear event")
      expect(json_date.to_i).to eq(datetime.to_i)
      expect(event["organisers"][0]["uuid"]).to match(user1.uuid)
      expect(event["organisers"][1]["uuid"]).to match(user2.uuid)
    end

    it "doesn't create a new event if organizers doesn't contain the current_user" do
      expect {
        post "/api/v1/events/create", params: { event: { title: "Bear Event", description: "Cool bear event", date: datetime, organisers: [ user2 ] } }.to_json,
                                      headers: { "CONTENT_TYPE" => "application/json" }
      }.not_to change(Event, :count)
    end

    it "doesn't create a new event if organizers is an empty array" do
      expect {
        post "/api/v1/events/create", params: { event: { title: "Bear Event", description: "Cool bear event", date: datetime, organisers: [] } }.to_json,
                                      headers: { "CONTENT_TYPE" => "application/json" }
      }.not_to change(Event, :count)
    end

    it "doesn't create a new event if organizers is nil" do
      expect {
        post "/api/v1/events/create", params: { event: { title: "Bear Event", description: "Cool bear event", date: datetime, organisers: nil } }.to_json,
                                      headers: { "CONTENT_TYPE" => "application/json" }
    }.not_to change(Event, :count)
    end

    it "doesn't create an event when the title is missing" do
      expect {
        post "/api/v1/events/create", params: { event: { description: "Cool bear event", date: datetime, organisers: [ user1.uuid, user2.uuid ] } }
      }.not_to change(Event, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "doesn't create an event when the title is longer than 100 characters" do
      event_title = "a" * 101

      expect {
        post "/api/v1/events/create", params: { event: { title: event_title, description: "Cool bear event", date: datetime, organisers: [ user1.uuid, user2.uuid ] } }
      }.not_to change(Event, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "updates existing events" do
    let(:event) { Event.create!(title: "Bear Event", organisers: [ user1, user2 ], description: "Bear event description") }
    it "updates the title and descriptions of an event" do
      post "/api/v1/events/update", params: { event: { event_id: event.id, title: "Rare Winter Bear Event", description: "Bear winter event description" } }

      expect(Event.find(event.id).title).to match("Rare Winter Bear Event")
      expect(Event.find(event.id).description).to match("Bear winter event description")
    end

    it "only updates title when description is missing" do
      post "/api/v1/events/update", params: { event: { event_id: event.id, title: "Rare Winter Bear Event" } }

      expect(Event.find(event.id).title).to match("Rare Winter Bear Event")
    end

    it "only updates description when title is missing" do
      post "/api/v1/events/update", params: { event: { event_id: event.id, description: "Bear winter event description"  } }

      expect(Event.find(event.id).description).to match("Bear winter event description")
    end

    it "doesn't update description if the current_user is not one of the organizers" do
      event_with_different_organizer = Event.create!(title: "Bear Event", organisers: [ user2 ], description: "Bear event description")

      post "/api/v1/events/update", params: { event: { event_id: event_with_different_organizer.id,
                                              title: "Rare Winter Bear Event",
                                              description: "Bear winter event description" }
                                            }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "handles event deletion" do
    let(:event_organized_by_current_user) { create(:event, organisers: [ User.first ]) }
    let(:event_with_multipl_organisers) { create(:event, organisers: [ User.first, create(:user, email: "test@mail.com") ]) }
    let(:event_not_organized_by_current_user) { create(:event, organisers: [ create(:user, email: "test@mail.com") ]) }

    it 'deletes an event when conditions are met' do
      event = Event.find_by(id: event_organized_by_current_user.id)
      expect {
        delete "/api/v1/events/delete", params: { event: { event_id: event.id } }
      }.to change(Event, :count).by(-1)
    end

    it 'does not delete an event when the person trying to delete it is not an organiser' do
      event = Event.find_by(id: event_not_organized_by_current_user.id)
      expect {
        delete "/api/v1/events/delete", params: { event: { event_id: event.id } }
      }.not_to change(Event, :count)
    end

    it 'does not delete an event when it still has more than one organiser' do
      event = Event.find_by(id: event_with_multipl_organisers.id)
      expect {
        delete "/api/v1/events/delete", params: { event: { event_id: event.id } }
      }.not_to change(Event, :count)
    end
  end
end
