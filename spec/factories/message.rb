FactoryBot.define do
  factory :message do
    sequence(:content) { |n| "Message #{n}" }
    association :chat
    association :user
  end
end
