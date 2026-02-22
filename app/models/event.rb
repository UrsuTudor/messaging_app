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
    max_size = 15 * 1024 * 1024

    errors.add(:cover_image, "Not a valid image type. The avatar needs to be in jpeg/png format.") unless valid_types.include?(cover_image.blob.content_type)

    errors.add(:cover_image, "Image size is too large. The avatar needs to be under 15 MB in size.") unless cover_image.blob.byte_size <= max_size
  end

  def add_participant(current_user)
    event_memberships.create!(
      user_id: current_user.id, 
      role: "participant", 
      status: "accepted"
    )
  end

  def add_organisers(user_list)
    user_list.each do |org|
      user = User.find_by(uuid: org)
      next unless user

      membership = EventMembership.find_or_initialize_by(
        user_id: user.id, 
        event_id: self.id
      )

      next if membership.role == "organiser"

      membership.role = "organiser"
      membership.status = "pending"
      membership.save!
    end
  end
end
