class Event < ApplicationRecord
  has_many :event_memberships, dependent: :destroy
  has_many :organisers,
           -> { where(event_memberships: { role: :organiser, status: "accepted" }) },
           through: :event_memberships,
           source: :user

  has_many :participants,
           -> { where(event_memberships: { role: :participant, status: "accepted" }) },
           through: :event_memberships,
           source: :user

  has_one_attached :cover_image

  validates :title, presence: true, length: { maximum: 100 }
  validates :date, presence: true
  validates :description, length: { maximum: 2000 }
  validate :validate_cover_image

  def validate_cover_image
    return unless cover_image.attached?

    valid_types = [ "image/jpeg", "image/png" ]
    max_size = 5 * 1024 * 1024

    errors.add(:cover_image, "Not a valid image type. The avatar needs to be in jpeg/png format.") unless valid_types.include?(cover_image.blob.content_type)

    errors.add(:cover_image, "Image size is too large. The avatar needs to be under 5 MB in size.") unless cover_image.blob.byte_size <= max_size
  end
end
