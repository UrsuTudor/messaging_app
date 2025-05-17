class Api::V1::ChatsController < ApplicationController
  def find_or_create
    receiver = User.find_by(uuid: chat_params[:receiver_uuid])
    return render json: { error: "Receiver not found" }, status: :not_found unless receiver

    chat = Chat.joins(:users)
        .where(users: { id: [ current_user.id, receiver.id ] })
        .group("chats.id")
        .having("COUNT(DISTINCT users.id) = 2")
        .first

    unless chat
      chat = Chat.new(users: [ current_user, receiver ])
      render json: chat.errors unless chat.save
    end

    render json: chat.messages
  end

  private

  def chat_params
    params.require(:chat).permit(:receiver_uuid)
  end
end
