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

User.create(name: "Dave", email: "dave@mail.com", password: "dave123")
100.times { create(:user) }
User.create(name: "Ash", email: "ash@mail.com", password: "ash123")

(1..25).each do |i|
  FactoryBot.create(:chat, users: [ User.first, User.find(i) ])
end

FactoryBot.create(:chat, users: [ User.first, User.second ], name: "Test Chat")
