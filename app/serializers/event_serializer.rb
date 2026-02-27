class EventSerializer
  include Rails.application.routes.url_helpers

  def initialize(event)
    @event = event
  end

  def safe_data
    {
      id: @event.id,
      title: @event.title,
      date: @event.date.strftime("%B %-d, %Y"),
      location: @event.location,
      cover_image_url: (
        @event.cover_image.attached? ? url_for(@event.cover_image) : nil
      )
    }
  end
end
