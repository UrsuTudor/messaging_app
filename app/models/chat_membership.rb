class ChatMembership < ApplicationRecord
  belongs_to :chat
  belongs_to :user

  def mark_unread!
    update!(read: false)
  end
end
