class Api::V1::UsersController < ApplicationController
  def index
    users = User.all
    render json: users.map { |user| user_data(user) }
  end

  def update
    if current_user.update(user_params)
      render json: { message: "Profile updated successfully" }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def current_user_info
    render json: { name: current_user.name, avatar: current_user.avatar, uuid: current_user.uuid, description: current_user.description }
  end

  private

  def user_data(user)
    {
      name: user.name,
      uuid: user.uuid,
      avatar: user.avatar
    }
  end

  def user_params
    params.require(:user).permit(:description)
  end
end
