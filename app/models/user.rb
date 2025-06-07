class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  before_create :assign_uuid
  validates :name, presence: true
  validate :validate_avatar

  has_one_attached :avatar
  has_many :chat_memberships
  has_many :chats, through: :chat_memberships

  def validate_avatar
    return unless avatar.attached?

    valid_types = [ "image/jpeg", "image/png" ]
    max_size = 5 * 1024 * 1024

    errors.add(:avatar, "Not a valid image type. The avatar needs to be in jpeg/png format.") unless valid_types.include?(avatar.blob.content_type)

    errors.add(:avatar, "Image size is too large. The avatar needs to be under 5 MB in size.") unless avatar.blob.byte_size <= max_size
  end

  private

  def assign_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
