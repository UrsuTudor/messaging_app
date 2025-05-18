class Api::V1::UsersController < ApplicationController
  def index
    users = User.all
    render json: users.map { |user| user_data(user) }
  end

  private

  def user_data(user)
    {
      name: user.name,
      uuid: user.uuid
      # avatar: user.avatar
    }
  end
end
