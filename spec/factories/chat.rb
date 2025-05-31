FactoryBot.define do
  factory :chat do
    after(:create) do |chat|
      users = [ User.first, User.second ]
      users.each do |user|
        create(:chat_membership, chat: chat, user: user)
      end

      create_list(:message, 3, chat: chat, user: users.sample)
    end
  end
end
