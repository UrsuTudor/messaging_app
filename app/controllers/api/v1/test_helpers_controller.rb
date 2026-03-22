class Api::V1::TestHelpersController < ApplicationController
    before_action :ensure_test_env
    skip_forgery_protection

    def create_event_invite
      dave = User.find_by(name: "Dave")

      event = Event.create_with_organiser!({title: "Test Event", date: DateTime.now}, User.last)

      event.add_organisers([dave.uuid])
    end

    def delete_event_invites
      dave = User.find_by(name: "Dave")

      dave.event_memberships.where(status: "pending").each do |m|
        m.destroy
      end
    end

    def create_future_event
      dave = User.find_by(name: "Dave")

      Event.create_with_organiser!({title: "Test Event", date: DateTime.tomorrow}, dave)
    end

    def create_past_event
      dave = User.find_by(name: "Dave")

      Event.create_with_organiser!({title: "Test Event", date: DateTime.yesterday}, dave)
    end

    def create_past_events
      25.times do |i|
        Event.create_with_organiser!({title: "Test Event #{i}", date: DateTime.yesterday}, User.find_by(name: "Ash"))
      end
    end

    def create_future_events
      25.times do |i|
        Event.create_with_organiser!({title: "Test Event #{i}", date: DateTime.tomorrow}, User.find_by(name: "Ash"))
      end
    end

    def delete_test_events
      Event.where("title LIKE ?", "Test Event%").destroy_all
    end

    private

    def ensure_test_env
        head :forbidden unless Rails.env.test?
    end
end
