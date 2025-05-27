class Api::V1::ChatsController < ApplicationController
  include ChatFinder
  def find_or_create
    receiver = find_receiver(chat_params[:receiver_uuid])
    return unless receiver

    chat = find_chat(current_user.id, receiver.id)

    unless chat
      chat = Chat.new(users: [ current_user, receiver ])
      render json: chat.errors unless chat.save
    end

    message_data = chat.messages.map do |message|
      { content: message.content, user_uuid: message.user.uuid }
    end

    render json: message_data
  end

  private

  def chat_params
    params.require(:chat).permit(:receiver_uuid)
  end
end
