class Api::V1::MessagesController < ApplicationController
  include ChatFinder

  def create
    receivers = find_receivers(message_params[:receiver_uuids]).map(&:id)

    chat = Chat.find(message_params[:chat_id])
    return render json: { error: "Chat not found" }, status: :not_found unless chat

    message = Message.new(chat: chat, user: current_user, content: message_params[:content])

    if message.save
      ActionCable.server.broadcast("chat_#{chat.id}", {
        content: message.content,
        user_uuid: message.user.uuid
      })

      receivers.each do |receiver_id|
        membership = chat.chat_memberships.find_by(user_id: receiver_id)
        membership.update(read: false) if membership

        ActionCable.server.broadcast("chatList_#{receiver_id}", { signal: "refresh" })
      end
    else
      render json: message.errors, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:message).permit(:content, :chat_id, receiver_uuids: [])
  end
end
