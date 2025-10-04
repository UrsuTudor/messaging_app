FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User#{n}" }
    sequence(:email) { |n| "user#{n}@mail.com" }
    password { 'password123' }
    sequence(:uuid) { |n| SecureRandom.uuid }

    after(:create) do |user|
      chat = FactoryBot.create(:chat, users: [ user, User.find(user.id - 1) ])
      FactoryBot.create_list(:message, 25, chat: chat, user: user)
    end
  end
end
