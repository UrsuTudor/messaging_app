class Chat < ApplicationRecord
  has_many :chat_memberships
  has_many :users, through: :chat_memberships
  has_many :messages
end
