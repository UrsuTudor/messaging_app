class AddNameToChats < ActiveRecord::Migration[7.2]
  def change
    add_column :chats, :name, :string
  end
end
