require 'rails_helper'

RSpec.describe "Event", type: :request do
  let(:user1) { create(:user, email: "testmail@mail.com") }
  let(:user2) { create(:user, email: "testmail2@mail.com") }
  let(:datetime) { DateTime.current }

  before do
    allow_any_instance_of(Api::V1::EventsController)
      .to receive(:current_user)
      .and_return(user1)

    create_list(:event, 27, organisers: [ user2 ])
  end

  describe "retrieves event data" do
    it "retrieves data of one event" do
      tested_event = Event.first
      tested_event.cover_image.attach(
        io: StringIO.new("fake image data"),
        filename: "test.png",
        content_type: "image/png"
      )

      get "/api/v1/events/#{tested_event.id}"

      event_data = JSON.parse(response.body)

      expect(event_data["id"]).to be(tested_event.id)
      expect(event_data["title"]).to match(tested_event.title)
      expect(event_data["description"]).to match(tested_event.description)
      expect(event_data["organisers"].length).to equal(tested_event.organisers.length)
      expect(event_data["date"]).to match(tested_event.date)
      expect(event_data["cover_image_url"]).to match(url_for(tested_event.cover_image))
    end

    it "retireves a paginated list of events" do
      get "/api/v1/events/all?page=1&search="

      page_one = JSON.parse(response.body)

      expect(page_one["events"].length).to be(20)
    end
  end

  describe "handles creation" do
    it "creates a new event when all the parameters are provided" do
      expect {
        post "/api/v1/events/create", params: { event: { title: "Bear Event", description: "Cool bear event", date: datetime } }
      }.to change(Event, :count).by(1)

      event = JSON.parse(response.body)
      json_date = DateTime.parse(event["date"])

      expect(event["title"]).to match("Bear Event")
      expect(event["description"]).to match("Cool bear event")
      expect(json_date.to_i).to eq(datetime.to_i)
      expect(event["organisers"][0][0]["uuid"]).to match(user1.uuid)
    end

    it "doesn't create an event when the title is missing" do
      expect {
        post "/api/v1/events/create", params: { event: { description: "Cool bear event", date: datetime } }
      }.not_to change(Event, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "doesn't create an event when the title is longer than 100 characters" do
      event_title = "a" * 101

      expect {
        post "/api/v1/events/create", params: { event: { title: event_title, description: "Cool bear event", date: datetime } }
      }.not_to change(Event, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "updates existing events" do
    let(:event) { create(:event, title: "Bear Event", description: "Bear event description", date: Date.current, organisers: [ user1 ]) }
    it "updates the title and descriptions of an event" do
      post "/api/v1/events/update", params: { event: { id: event.id, title: "Rare Winter Bear Event", description: "Bear winter event description" } }

      expect(Event.find(event.id).title).to match("Rare Winter Bear Event")
      expect(Event.find(event.id).description).to match("Bear winter event description")
    end

    it "only updates title when description is missing" do
      post "/api/v1/events/update", params: { event: { id: event.id, title: "Rare Winter Bear Event" } }

      expect(Event.find(event.id).title).to match("Rare Winter Bear Event")
    end

    it "only updates description when title is missing" do
      post "/api/v1/events/update", params: { event: { id: event.id, description: "Bear winter event description"  } }

      expect(Event.find(event.id).description).to match("Bear winter event description")
    end

    it "doesn't update description if the current_user is not one of the organisers" do
      event_with_different_organiser = create(:event, title: "Bear Event", description: "Bear event description", organisers: [ user2 ])

      post "/api/v1/events/update", params: { event: { id: event_with_different_organiser.id,
                                              title: "Rare Winter Bear Event",
                                              description: "Bear winter event description" }
                                            }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "handles event deletion" do
    let(:event_organised_by_current_user) { create(:event, organisers: [ user1 ]) }
    let(:event_with_multiple_organisers) { create(:event, organisers: [ user1, user2 ]) }
    let(:event_not_organised_by_current_user) { create(:event, organisers: [ user2 ]) }

    it 'deletes an event when conditions are met' do
      event = Event.find_by(id: event_organised_by_current_user.id)
      expect {
        delete "/api/v1/events/delete", params: { event: { id: event.id } }
      }.to change(Event, :count).by(-1)
    end

    it 'does not delete an event when the person trying to delete it is not an organiser' do
      event = Event.find_by(id: event_not_organised_by_current_user.id)
      expect {
        delete "/api/v1/events/delete", params: { event: { id: event.id } }
      }.not_to change(Event, :count)
    end

    it 'does not delete an event when it still has more than one organiser' do
      event = Event.find_by(id: event_with_multiple_organisers.id)
      expect {
        delete "/api/v1/events/delete", params: { event: { id: event.id } }
      }.not_to change(Event, :count)
    end
  end
end
