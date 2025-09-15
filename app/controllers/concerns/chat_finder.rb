module ChatFinder
  extend ActiveSupport::Concern

  def find_receivers(receiver_uuids)
    chat_members = []

    receiver_uuids.each do |uuid|
      member = User.find_by(uuid: uuid)

      unless member
        render json: { error: "Chat member could not be found." }, status: :not_found
        return
      end

      chat_members << member
    end

    chat_members
  end

  def find_private_chat(sender_id, receiver_id)
    Chat.joins(:users)
      .where(users: { id: [ sender_id, receiver_id ] })
      .group("chats.id")
      .having("COUNT(DISTINCT users.id) = 2")
      .first
  end
end
