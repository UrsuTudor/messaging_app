class MessagesController < ApplicationController
  def create
  end

  private

  def message_params
    params.require(:message).permit(:content, :receiver_uuid)
  end
end
