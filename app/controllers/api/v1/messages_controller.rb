class Api::V1::MessagesController < ApplicationController
  include ChatFinder

  def create
    receiver = find_receiver(message_params[:receiver_uuid])
    return unless receiver

    chat = find_chat(current_user.id, receiver.id)
    return render json: { error: "Chat not found" }, status: :not_found unless chat

    message = Message.new(chat: chat, user: current_user, content: message_params[:content])

    if message.save
      render json: { chat_messages: chat.messages }
    else
      render json: message.errors, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:message).permit(:content, :receiver_uuid)
  end
end
