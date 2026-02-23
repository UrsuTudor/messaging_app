class Api::V1::EventsController < ApplicationController
  include Pagy::Backend

  def index
    events = Event
                .upcoming
                .search(params[:search])
                .excluding_user_already_member(current_user)
                .distinct

    @pagy, @events = pagy(events, page: params[:page], limit: 20)

    render json: {
      events: @events.map { |e| event_data(e) },
      metadata: pagy_metadata(@pagy)
    }
  end

  def show
    event = Event.includes(:organisers, :participants).find(params[:id])

    render json: {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      organisers: event.organisers.map { |org| user_data(org) },
      participants: event.participants.map { |part| user_data(part) },
      date: event.date.strftime("%B %-d, %Y"),
      cover_image_url: (
        event.cover_image.attached? ? url_for(event.cover_image) : nil
      )
    }
  end

  def create
    event = Event.create_with_organiser!(event_params, current_user)

    render json: { 
      event_id: event.id, 
      title: event.title, 
      description: event.description, 
      organisers: [ user_data(current_user) ], 
      date: event.date 
    }, status: :created

  rescue ActiveRecord::RecordInvalid => event
    render json: event.record.errors, status: :unprocessable_entity
  end

  def update
    event = Event.find(event_params[:id])

    return head :forbidden unless event.organised_by?(current_user)

    if event.update(event_params)
      render json: { event_id: event.id, message: "Update successful" }
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    event = Event.find(event_params[:id])

    authorised = event.organised_by?(current_user) && event.one_organiser?
    return head :forbidden unless authorised

    event.destroy!
    head :no_content
  end

  def locations
    locations = PlacesApiService.new.search(params[:search])
    render json: { locations: locations }
  end

  private

  def event_params
    params.require(:event).permit(:id, :title, :cover_image, :description, :date, :location)
  end

  def user_data(user)
    [ {
      name: user.name,
      uuid: user.uuid,
      avatar: user.avatar.attached? ? url_for(user.avatar) : nil,
      description: user.description,
      events: user.events.map do |event|
        event_data(event)
      end
    } ]
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
