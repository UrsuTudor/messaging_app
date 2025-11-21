FactoryBot.define do
  factory :event_membership do
    event
    user
    role { "participant" }
  end
end
