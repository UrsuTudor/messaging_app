FactoryBot.define do
  factory :event do
    sequence(:title) { |n| "Event#{n}" }
    date { Date.current }

    transient do
      organisers { [] }
    end

    after(:create) do |event, evaluator|
      evaluator.organisers.each do |organiser|
        create(:event_membership, event: event, user: organiser, role: "organiser")
      end
    end
  end
end
