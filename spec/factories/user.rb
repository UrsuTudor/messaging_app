FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User#{n}" }
    sequence(:email) { |n| "user#{n}@mail.com" }
    password { 'password123' }
    sequence(:uuid) { |n| SecureRandom.uuid }
  end
end
