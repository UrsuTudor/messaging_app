class Api::V1::UsersController < ApplicationController
  include Pagy::Backend
  def index
    user_ids_with_chat = current_user.chats
      .joins(:users)
      .where.not(users: { id: current_user.id })
      .pluck("users.id")
      .uniq

    @pagy, @users = pagy(
      User.where.not(id: [ current_user.id ] + user_ids_with_chat),
      page: params[:page],
      limit: 20
    )

    render json: {
      users: @users.map { |user| user_data(user) },
      metadata: pagy_metadata(@pagy)
    }
  end

  def users_with_chat
    @pagy, @users_with_chat = pagy(
      current_user.chats
        .left_joins(:messages)
        .includes(:messages, :users)
        .group("chats.id")
        .order("MAX(messages.created_at) DESC NULLS LAST"),
      page: params[:page], limit: 20
    )

    users_with_chat_array = @users_with_chat.filter_map do |chat|
      receiver = chat.users.find { |user| user.uuid != current_user.uuid }
      receiver_data = user_data(receiver)
      receiver_data[:last_message] = chat.messages.last&.content

      receiver_data
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
      uuid: current_user.uuid, description: current_user.description }
  end

  private

  def user_data(user)
    {
      name: user.name,
      uuid: user.uuid,
      avatar: user.avatar.attached? ? url_for(user.avatar) : nil,
      description: user.description
    }
  end

  def user_params
    params.require(:user).permit(:description, :avatar)
  end
end
