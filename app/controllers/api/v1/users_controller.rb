class Api::V1::UsersController < ApplicationController
  include Pagy::Backend
  def index
    @pagy, @users = pagy(User.all, page: params[:page], limit: 15)
    render json: {
      users: @users
              .reject { |user| user.uuid == current_user.uuid }
              .map { |user| user_data(user) },
      metadata: pagy_metadata(@pagy)
    }
  end

  def users_with_chat
    users_with_chat_array = current_user.chats.includes(:messages, :users).filter_map do |chat|
      next unless chat.messages.last&.content

      receiver = chat.users.find { |user| user.uuid != current_user.uuid }
      receiver_data = user_data(receiver)
      receiver_data[:last_message] = chat.messages.last&.content

      receiver_data
    end

    render json: { chat_users: users_with_chat_array }
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
      avatar: user.avatar.attached? ? url_for(user.avatar) : nil
    }
  end

  def user_params
    params.require(:user).permit(:description, :avatar)
  end
end
