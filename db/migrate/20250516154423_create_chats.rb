class CreateChats < ActiveRecord::Migration[7.2]
  def change
    create_table :chats do |t|
      t.timestamps
    end
  end
end
