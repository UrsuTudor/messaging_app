class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  before_create :assign_uuid
  validates :name, presence: true

  has_one_attached :avatar
  has_many :chat_memberships
  has_many :chats, through: :chat_memberships

  private

  def assign_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
