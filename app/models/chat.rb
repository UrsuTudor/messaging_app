class Chat < ApplicationRecord
  validates :name, length: { maximum: 50 }

  has_many :chat_memberships
  has_many :users, through: :chat_memberships
  has_many :messages
end
