class ChatChannel < ApplicationCable::Channel
  def subscribed
    chat = Chat.find(params[:room])

    if chat.users.include?(current_user)
      stream_from "chat_#{params[:room]}"
    else
      reject
    end
  end
end
