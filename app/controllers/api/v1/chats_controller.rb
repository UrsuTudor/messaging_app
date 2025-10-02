class Api::V1::ChatsController < ApplicationController
  include Pagy::Backend

  include ChatFinder
  def find_or_create
    receivers = find_receivers(chat_params[:receiver_uuids])

    chat = receivers.length == 1 ? find_private_chat(current_user.id, receivers[0].id) : nil

    if chat.nil? && chat_params[:chat_id]
      chat = Chat.find(chat_params[:chat_id])
    elsif chat.nil?
      chat = Chat.new(users: [ current_user, *receivers ])
      render json: chat.errors unless chat.save

      ActionCable.server.broadcast("chatList_#{current_user.id}", { signal: "refresh" })
      receivers.each do |receiver_id|
        ActionCable.server.broadcast("chatList_#{receiver_id}", { signal: "refresh" })
      end
    end
    return unless chat.users.include?(current_user)

    @pagy, @messages = pagy(chat.messages.order(created_at: :desc), page: params[:page], limit: 20)

    message_data = @messages.map do |message|
      { content: message.content, user_uuid: message.user.uuid, user_name: message.user.name }
    end

    render json: { chat_id: chat.id, messages: message_data, name: chat.name, metadata: pagy_metadata(@pagy) }
  end

  def update_read_status
    chat = Chat.find(chat_params[:chat_id])
    return unless chat.users.include?(current_user)

    membership = chat.chat_memberships.find_by(user_id: current_user.id)
    membership&.update(read: true)
  end

def update
  chat = Chat.find(chat_params[:chat_id])

  return head :forbidden unless chat.users.include?(current_user)

  if chat.update(name: chat_params[:name])
    render json: "update successful"
  else
    render json: { errors: chat.errors.full_messages }, status: :unprocessable_entity
  end
end

  private

  def chat_params
    params.require(:chat).permit(:chat_id, :name, receiver_uuids: [])
  end
end
