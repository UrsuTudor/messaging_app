FactoryBot.define do
  factory :user do
    name { 'Dave' }
    email { 'dave@mail.com' }
    password { 'dave123' }
    uuid { '123' }
  end
end
