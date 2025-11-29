FactoryBot.define do
  factory :event_membership do
    event
    user
    role { "participant" }
    status { "accepted" }
  end
end
