FactoryBot.define do
  factory :message do
    content { "Hello" }
    association :chat
    association :user
  end
end
