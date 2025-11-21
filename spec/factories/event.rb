FactoryBot.define do
  factory :event do
    sequence(:title) { |n| "Event#{n}" }

    after(:create) do |event|
      create(:event_membership, event: event, role: "organiser")
    end
  end
end
