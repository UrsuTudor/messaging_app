module ChatFinder
  extend ActiveSupport::Concern

  def find_receiver(receiver_uuid)
    receiver = User.find_by(uuid: receiver_uuid)
    unless receiver
      render json: { error: "Receiver not found" }, status: :not_found and return
    end
    receiver
  end

  def find_chat(sender_id, receiver_id)
    Chat.joins(:users)
      .where(users: { id: [ sender_id, receiver_id ] })
      .group("chats.id")
      .having("COUNT(DISTINCT users.id) = 2")
      .first
  end
end
