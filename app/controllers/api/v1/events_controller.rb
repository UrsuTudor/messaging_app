class Api::V1::EventsController < ApplicationController
  include Pagy::Backend

  def index
    search = "%#{params[:search]}%"

    events = Event
        .where.not(
          id: EventMembership.where(user_id: current_user.id).select(:event_id)
        )
        .where("title ILIKE :search OR location ILIKE :search", search: search)
        .distinct

    @pagy, @events = pagy(events, page: params[:page], limit: 20)

    render json: {
      events: @events.map { |e| event_data(e) },
      metadata: pagy_metadata(@pagy)
    }
  end

  def show
    event = Event.find_by(id: params[:id])
    return "The event could not be found.", status: :not_found unless event

    render json: {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      organisers: event.organisers.map { |org| user_data(org) },
      date: event.date,
      cover_image_url: (
        event.cover_image.attached? ? url_for(event.cover_image) : nil
      )
    }
  end

  def create
    event = Event.new(title: event_params[:title],
                      description: event_params[:description],
                      date: event_params[:date],
                      location: event_params[:location],
                      cover_image: event_params[:cover_image]
    )

    if event.save
      event.event_memberships.create!(user_id: current_user.id, role: "organiser", status: "accepted")

      render json: { event_id: event.id, title: event.title, description: event.description, organisers: [ user_data(current_user) ], date: event.date }
    else
      render json: event.errors, status: :unprocessable_entity
    end
  end

  def update
    event = Event.find_by(id: event_params[:id])

    return head :not_found unless event
    return head :forbidden unless event.organisers.include?(current_user)

    if event.update(event_params.slice(:title, :description))
      render json: "Update successful"
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    event = Event.find_by(id: event_params[:id])
    return head :not_found unless event

    authorised = event.organisers.include?(current_user) && event.organisers.count == 1
    return head :forbidden unless authorised

    event.destroy!
    head :no_content
  end

  def locations
    api_key = ENV["PLACES_API_KEY"]

    response = HTTParty.post(
      "https://places.googleapis.com/v1/places:searchText",
      headers: {
        "Content-Type" => "application/json",
        "X-Goog-Api-Key" => api_key,
        "X-Goog-FieldMask" => "places.displayName,places.formattedAddress,places.id"
      },
      body: {
        textQuery: params[:search]
      }.to_json
    )

    # normalized for simplicity on the frontend
    return render json: { locations: [ { name: "No location found", id: "fakekey" } ] } unless response["places"]

    locations = response["places"].map do |location|
      {
        name: location["displayName"]["text"] + ", " + location["formattedAddress"],
        id: location["id"]
      }
    end

    render json: { locations: locations }
  end

  private

  def event_params
    params.require(:event).permit(:id, :title, :cover_image, :description, :date, :location)
  end

  def user_data(user)
    {
      name: user.name,
      uuid: user.uuid,
      avatar: user.avatar.attached? ? url_for(user.avatar) : nil,
      description: user.description,
      events: user.events.map do |event|
        event_data(event)
      end
    }
  end

   def event_data(e)
    {
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.strftime("%B %-d, %Y"),
      location: e.location,
      cover_image_url: (
        e.cover_image.attached? ? url_for(e.cover_image) : nil
      )
    }
  end
end
