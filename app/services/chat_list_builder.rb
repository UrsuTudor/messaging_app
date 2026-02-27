class ChatListBuilder
  def initialize(chats:, current_user:, search_term:)
    @chats = chats
    @current_user = current_user
    @search_term = search_term
  end

  def call
    @chats.filter_map do |chat|
      chat
        .filter_users(@search_term, [@current_user.uuid])
        .map { |receiver| UserSerializer.new(receiver).safe_chat_data(chat, @search_term, @current_user) }
    end
  end

end
