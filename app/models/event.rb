class Event < ApplicationRecord
  has_many :event_memberships, dependent: :destroy
  has_many :organisers,
           -> { where(event_memberships: { role: :organiser }) },
           through: :event_memberships,
           source: :user

  has_many :participants,
           -> { where(event_memberships: { role: :participant }) },
           through: :event_memberships,
           source: :user

  validates :title, presence: true, length: { maximum: 100 }
end
