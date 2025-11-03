class Api::V1::EventMembershipsController < ApplicationController
  include Pagy::Backend

  def index
    event = Event.find_by(id: event_membership_params[:event_id])
    return head :not_found unless event

    @pagy, @memberships = pagy(
      event.event_memberships
          .where(role: EventMembership.roles[params[:search]])
          .distinct,
      page: params[:page],
      limit: 20
    )

    users = @memberships.map(&:user)

    render json: {
      users: users.map { |user| user_data(user) },
      metadata: pagy_metadata(@pagy)
    }
  end

  def create
    event = Event.find_by(id: event_membership_params[:event_id])

    return head :not_found unless event

    if event.event_memberships.exists?(user_id: current_user.id)
      return render json: { error: "You are already a participant" }, status: :unprocessable_entity
    elsif event.date.past?
      return render json: { error: "Cannot join a past event" }, status: :unprocessable_entity
    end

    event.event_memberships.create!(user_id: current_user.id, role: :participant)

    render json: { message: "Joined event successfully" }, status: :ok
  end

  def destroy
    event = Event.find_by(id: event_membership_params[:event_id])

    return head :not_found unless event
    unless event.event_memberships.exists?(user_id: current_user.id)
      return render json: { error: "You are not a participant of this event" },
            status: :not_found
    end

    if event.event_memberships.where(role: "organiser").size == 1 &&
      event.event_memberships.find_by(user_id: current_user.id)&.role == "organiser"
      render json: {
        error: "You are the only organiser of this event. If you wish to cancel this event, you must use the 'Cancel' button"
      }, status: :unprocessable_content
      return
    end

    event.event_memberships.find_by(user_id: current_user.id).destroy!
  end

  private

  def event_membership_params
    params.require(:event_membership).permit(:event_id)
  end

  def user_data(user)
    {
      name: user.name,
      uuid: user.uuid,
      avatar: user.avatar.attached? ? url_for(user.avatar) : nil,
      description: user.description
    }
  end
end
