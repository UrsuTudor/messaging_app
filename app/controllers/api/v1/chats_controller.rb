class Api::V1::ChatsController < ApplicationController
  include Pagy::Backend

  include ChatFinder
  def find_or_create
    receiver = find_receiver(chat_params[:receiver_uuid])
    return unless receiver

    chat = find_chat(current_user.id, receiver.id)

    unless chat
      chat = Chat.new(users: [ current_user, receiver ])
      render json: chat.errors unless chat.save
    end

    @pagy, @messages = pagy(chat.messages.order(created_at: :desc), page: params[:page], limit: 20)

    message_data = @messages.map do |message|
      { content: message.content, user_uuid: message.user.uuid }
    end

    render json: { chat_id: chat.id, messages: message_data, metadata: pagy_metadata(@pagy) }
  end

  def update_read_status
    chat = Chat.find(params[:chat][:chat_id])
    return unless chat.users.include?(current_user)

    membership = chat.chat_memberships.find_by(user_id: current_user.id)
    membership&.update(read: true)
  end

  private

  def chat_params
    params.require(:chat).permit(:receiver_uuid, :chat_id)
  end
end
