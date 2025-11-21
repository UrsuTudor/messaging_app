FactoryBot.define do
  factory :event_membership do
    event
    user
    role { "organiser" }
  end
end
