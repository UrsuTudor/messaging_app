class Chat < ApplicationRecord
  validates :name, length: { maximum: 50 }

  has_many :chat_memberships
  has_many :users, through: :chat_memberships
  has_many :messages

  def allows_member_removal?
    chat_memberships.count > 2
  end

  def remove_member!(user)
    raise NotEnoughMembersError unless allows_member_removal?

    membership = chat_memberships.find_by(user: user)
    raise NotParticipantError unless membership

    membership.destroy!
  end

  def recent_messages
    messages.order(created_at: :desc)
  end

  def user_is_member?(user)
    users.exists?(user.id)
  end

  def get_membership(user_id)
    chat_memberships.find_by(user_id: user_id)
  end

  class NotEnoughMembersError < StandardError; end
  class NotParticipantError < StandardError; end
end
