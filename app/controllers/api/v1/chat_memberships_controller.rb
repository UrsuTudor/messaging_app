class Api::V1::ChatMembershipsController < ApplicationController
  def destroy
    chat = Chat.find_by(id: chat_membership_params[:chat_id])

    return head :not_found unless chat
    return render json: { error: "You cannot leave a chat that only has two users in it" },
            status: :forbidden unless chat.chat_memberships.count() > 2

    membership = chat.chat_memberships.find_by(user_id: current_user.id)

    return render json: { error: "You are not a participant of this chat" },
            status: :not_found unless membership

    membership.destroy!
  end

  private

  def chat_membership_params
    params.require(:chat_membership).permit(:chat_id)
  end
end
