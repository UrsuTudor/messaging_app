class Api::V1::UsersController < ApplicationController
  def index
    users = User.all
    render json: users.select { |user| user.uuid != current_user.uuid }.map { |user| user_data(user) }
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
