class Api::V1::MessagesController < ApplicationController
  include ChatFinder

  def create
    return render(json: { error: "No receivers provided" }, status: :not_found) unless message_params[:receiver_uuids]

    receivers = find_receivers(message_params[:receiver_uuids]).map(&:id)

    chat = Chat.find(message_params[:chat_id])
    return unless chat.user_is_member?(current_user)

    message = Message.new(chat: chat, user: current_user, content: message_params[:content])

    if message.save
      ChatNotifierService.new.call(chat, message, receivers)

      render json: {message:"Message created"}, status: :created
    else
      render json: message.errors, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:message).permit(:content, :chat_id, receiver_uuids: [])
  end
end
