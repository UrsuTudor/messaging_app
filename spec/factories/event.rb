FactoryBot.define do
  factory :event do
    sequence(:title) { |n| "Event#{n}" }
    date { Date.tomorrow }

    transient do
      organisers { [] }
    end

    after(:create) do |event, evaluator|
      evaluator.organisers.each do |organiser|
        create(:event_membership, event: event, user: organiser, role: "organiser", status: "accepted")
      end
    end
  end
end
