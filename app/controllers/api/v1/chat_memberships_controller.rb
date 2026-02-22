class Api::V1::ChatMembershipsController < ApplicationController

  def destroy
    chat = Chat.find_by(id: chat_membership_params[:chat_id])
    return head :not_found unless chat

    chat.remove_member!(current_user)
    head :no_content

  rescue  Chat::NotEnoughMembersError
    render json: { error: "You cannot leave a 2-person chat" }, status: :forbidden
  rescue Chat::NotParticipantError
    render json: { error: "You are not a participant of this chat" }, status: :not_found
  end

  private

  def chat_membership_params
    params.require(:chat_membership).permit(:chat_id)
  end
end
