class Message < ApplicationRecord
  belongs_to :chat, dependent: :destroy
  belongs_to :user
end
