class ChatListChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chatList_#{current_user.id}"
  end
end
