FactoryBot.define do
  factory :user do
    sequence(:name)  { |n| "User#{n}" }
    sequence(:email) { |n| "user#{n}@mail.com" }
    password { "password123" }
    sequence(:uuid)  { SecureRandom.uuid }

    after(:create) do |user|
      previous_user = User.where("id < ?", user.id).order(id: :desc).first

      if previous_user
        chat = FactoryBot.create(:chat, users: [ user, previous_user ])
        FactoryBot.create_list(:message, 25, chat: chat, user: user)
      end
    end
  end
end
