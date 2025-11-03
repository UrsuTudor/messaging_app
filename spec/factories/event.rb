FactoryBot.define do
  factory :event do
    sequence(:title) { |n| "Event#{n}" }
  end
end
