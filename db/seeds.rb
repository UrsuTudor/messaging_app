# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

require 'factory_bot_rails'
include FactoryBot::Syntax::Methods

dave1 = User.create(name: "Dave", email: "dave@mail.com", password: "dave123", description: "fake user")
dave1.avatar.attach(
  io: File.open(Rails.root.join('public', 'icon.png')),
  filename: "icon.png",
  content_type: "image/png"
)

Event.create_with_organiser!({title: "Old Test Event", date: DateTime.yesterday}, dave1)

100.times { create(:user) }
dave2 = User.create(name: "Dave2", email: "dave2@mail.com", password: "dave2123")
User.create(name: "Ash", email: "ash@mail.com", password: "ash123")

(3..25).each do |i|
  chat = Chat.create!(name: "Chat #{i}")
  chat.users << dave1
  chat.users << User.find(i)
end

chat = Chat.create!(name: "Test Chat", users: [dave1, dave2])
FactoryBot.create_list(:message, 25, chat: chat, user: User.second)
