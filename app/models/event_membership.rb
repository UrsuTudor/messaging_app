class EventMembership < ApplicationRecord
  belongs_to :user
  belongs_to :event
  enum :role, { participant: 0, organiser: 1 }
end
