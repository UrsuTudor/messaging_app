class Api::V1::TestHelpersController < ApplicationController
    before_action :ensure_test_env
    skip_forgery_protection

    def create_event_invite
        dave = User.find_by(name: "Dave")

        event = Event.create_with_organiser!({title: "Test Event", date: DateTime.now}, User.last)

        event.add_organisers([dave.uuid])
    end

    def create_future_event
        dave = User.find_by(name: "Dave")

        Event.create_with_organiser!({title: "Future Test Event", date: DateTime.tomorrow}, dave)
    end

    private

    def ensure_test_env
        head :forbidden unless Rails.env.test?
    end
end
