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
    return head :unprocessable_entity unless event_membership_params[:role]

    event = Event.find_by(id: event_membership_params[:event_id])

    return head :not_found unless event
    return render json: { error: "Cannot join past events" }, status: :unprocessable_entity if event.date.past?

    if event_membership_params[:role] == "participant"
      return render json: { error: "User is already a participant" }, status: :unprocessable_content  if event.event_memberships.exists?(user_id: current_user.id)
      event.event_memberships.create!(user_id: current_user.id, role: "participant", status: "accepted")
    elsif event_membership_params[:role] == "organiser"
      return head :forbidden unless event.organisers.exists?(current_user.id)

      event_membership_params[:user_uuids].each do |org|
        user = User.find_by(uuid: org)
        next unless user

        membership = EventMembership.find_or_initialize_by(user_id: user.id, event_id: event.id)
        next if membership.role == "organiser"

        membership.role = "organiser"
        membership.status = "pending"
        membership.save!
      end
    end

    render json: { message: "Membership created successfully" }, status: :ok
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

  def update
    membership = EventMembership.find_by(event_id: event_membership_params[:event_id], user_id: current_user.id)
    return head :not_found unless membership

    case event_membership_params[:reply]
    when "decline"
      membership.update!(status: "declined")
    when "accept"
      membership.update!(status: "accepted")
    when "delete"
      membership.update!(status: "deleted")
    else
      return render json: { error: "Invalid reply" }, status: :unprocessable_content
    end

    head :no_content
  end

  private

  def event_membership_params
    params.require(:event_membership).permit(:event_id, :role, :reply, user_uuids: [])
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
