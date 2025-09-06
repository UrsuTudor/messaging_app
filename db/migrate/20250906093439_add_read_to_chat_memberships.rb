class AddReadToChatMemberships < ActiveRecord::Migration[7.2]
  def change
    add_column :chat_memberships, :read, :boolean, default: true
  end
end
