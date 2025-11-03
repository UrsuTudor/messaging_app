FactoryBot.define do
  factory :user do
    sequence(:name)  { |n| "User#{n}" }
    sequence(:email) { |n| "user#{n}@mail.com" }
    password { "password123" }
    sequence(:uuid)  { SecureRandom.uuid }

    after(:create) do |user|
      # Find the most recently created user before this one (if any)
      previous_user = User.where("id < ?", user.id).order(id: :desc).first

      # Only create a chat if there actually is another user
      if previous_user
        chat = FactoryBot.create(:chat, users: [ user, previous_user ])
        FactoryBot.create_list(:message, 25, chat: chat, user: user)
      end
    end
  end
end

# FactoryBot.define do
#   factory :user do
#     sequence(:name) { |n| "User#{n}" }
#     sequence(:email) { |n| "user#{n}@mail.com" }
#     password { 'password123' }
#     sequence(:uuid) { |n| SecureRandom.uuid }

#     after(:create) do |user|
#       chat = FactoryBot.create(:chat, users: [ user, User.find(user.id - 1) ])
#       FactoryBot.create_list(:message, 25, chat: chat, user: user)
#     end
#   end
# end
