class Api::V1::UsersController < ApplicationController
  include Pagy::Backend
  def index
    @pagy, @users = pagy(
      User.where(id: current_user.users_without_private_chat(params[:search]).select(:id)),
      page: params[:page],
      limit: 20
    )

    user_data = @users.map { |user| UserSerializer.new(user).safe_data }

    render json: {
      users: user_data,
      metadata: pagy_metadata(@pagy)
    }
  end

  def users_with_private_chat
    users = current_user.users_with_private_chat(params[:search])

    render json: { chat_users: users.map { |u| [UserSerializer.new(u).safe_data]} }
  end

  def paginated_users_with_chat
    search_term = params[:search].to_s.downcase

    @pagy, @chats_with_user_data = pagy(
      current_user.recent_chats(search_term),
      page: params[:page], limit: 20
    )

    array_of_users_with_chat_data = ChatListBuilder.new(
      chats: @chats_with_user_data, 
      current_user: current_user, 
      search_term: search_term
    ).call

    render json: { chat_users: array_of_users_with_chat_data, metadata: pagy_metadata(@pagy) }
  end

  def update
    if current_user.update(user_params)
      render json: { message: "Profile updated successfully" }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def current_user_info
    render json: UserSerializer.new(current_user).safe_current_user_data
  end

  private

  def user_params
    params.require(:user).permit(:description, :avatar)
  end
end
