class ChatNotifierService
  def call(chat, message, receivers)
    broadcast_message(chat, message)
    broadcast_notification(chat, receivers)
  end

  private 
  
  def broadcast_message(chat, message)
    ActionCable.server.broadcast("chat_#{chat.id}", {
      content: message.content,
      user_uuid: message.user.uuid,
      user_name: message.user.name
    })
  end

  def broadcast_notification(chat, receivers)
    receivers.each do |receiver_id|
      membership = chat.get_membership(receiver_id)
      membership.mark_unread! if membership

      ActionCable.server.broadcast("chatList_#{receiver_id}", { signal: "refresh" })
    end
  end
end
