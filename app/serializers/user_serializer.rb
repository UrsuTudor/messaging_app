class UserSerializer
  include Rails.application.routes.url_helpers

  def initialize(user)
    @user = user
  end

  # returns safe data for profiles
  def safe_data
    {
      name: @user.name,
      uuid: @user.uuid,
      avatar: @user.avatar.attached? ? url_for(@user.avatar) : nil,
      description: @user.description,
      events: @user.events.map { |event| EventSerializer.new(event).safe_data }
    }
  end

  # returns safe data for the chat list
  def safe_chat_data(chat, search_term, current_user)
    data = safe_data
    data[:chat_id] = chat.id
    data[:chat_name] = chat.name
    data[:read] = chat.chat_memberships.find_by(user_id: current_user.id).read

    data
  end

  def safe_current_user_data
    {
      name: @user.name,
      avatar: @user.avatar.attached? ? url_for(@user.avatar) : nil,
      uuid: @user.uuid,
      description: @user.description,
      events: @user.events.map do |event|
        EventSerializer.new(event).safe_data
      end,
      pending_requests: @user.event_memberships
                                    .where(status: "pending")
                                    .pluck(:event_id)
    }
  end
end
