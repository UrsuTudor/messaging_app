class Api::V1::UsersController < ApplicationController
  include Pagy::Backend
  def index
    user_ids_with_chat = current_user.chats
      .joins(:users)
      .where.not(users: { id: current_user.id })
      .where(
        id: Chat.joins(:users)
                .group("chats.id")
                .having("COUNT(users.id) = 2")
      )
      .pluck("users.id")
      .uniq

    @pagy, @users = pagy(
      User.where.not(id: [ current_user.id ] + user_ids_with_chat)
          .where("name ILIKE ?", "%#{params[:search]}%"),
      page: params[:page],
      limit: 20
    )

    render json: {
      users: @users.map { |user| user_data(user) },
      metadata: pagy_metadata(@pagy)
    }
  end

  def users_with_private_chat
    users = current_user.chats
                        .includes(:users)

    search_term = params[:search].to_s.downcase

    users_with_chat_array = users.filter_map do |chat|
      next if chat.users.count > 2

      receivers = filter_users(chat, search_term, params[:filters])
      next unless receivers.any?

      data_of_receivers = []

      receivers.each do |receiver|
        receiver_data = user_data(receiver)
        data_of_receivers << receiver_data
      end

      data_of_receivers
    end

    render json: { chat_users: users_with_chat_array }
  end

  def paginated_users_with_chat
   @pagy, @users_with_chat = pagy(
      current_user.chats
      .left_joins(:messages, :users)
      .includes(:messages, :users)
      .where("chats.name ILIKE :term OR users.name ILIKE :term", term: "%#{params[:search]}%")
      .group("chats.id")
      .order(Arel.sql("MAX(messages.created_at) DESC NULLS LAST")),
      page: params[:page], limit: 20
    )

    search_term = params[:search].to_s.downcase

    users_with_chat_array = @users_with_chat.filter_map do |chat|
      receivers = filter_users(chat, search_term)
      next unless receivers.any?

      data_of_receivers = []

      receivers.each do |receiver|
        receiver_data = user_data(receiver)
        receiver_data[:chat_id] = chat.id
        receiver_data[:chat_name] = chat.name
        receiver_data[:read] = chat.chat_memberships.find_by(user_id: current_user.id).read

        data_of_receivers << receiver_data
      end

      data_of_receivers
    end

    render json: { chat_users: users_with_chat_array, metadata: pagy_metadata(@pagy) }
  end

  def update
    if current_user.update(user_params)
      render json: { message: "Profile updated successfully" }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def current_user_info
    render json: {
      name: current_user.name,
      avatar: current_user.avatar.attached? ? url_for(current_user.avatar) : nil,
      uuid: current_user.uuid,
      description: current_user.description,
      events: current_user.events.map do |event|
        event_data(event)
      end,
      pending_requests: current_user.event_memberships
                                    .where(status: "pending")
                                    .pluck(:event_id)
    }
  end

  private

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
      date: e.date.strftime("%B %-d, %Y"),
      location: e.location,
      cover_image_url: (
        e.cover_image.attached? ? url_for(e.cover_image) : nil
      )
    }
  end

  def filter_users(chat, search_term, uuids_to_filter = [])
    uuids_to_filter << current_user.uuid

    chat.users.select do |user|
      uuids_to_filter.exclude?(user.uuid) &&
        (user.name.downcase.include?(search_term) ||
        chat.name&.downcase&.include?(search_term))
    end
  end

  def user_params
    params.require(:user).permit(:description, :avatar)
  end
end
