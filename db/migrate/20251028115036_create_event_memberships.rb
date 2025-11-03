class CreateEventMemberships < ActiveRecord::Migration[7.2]
  def change
    create_table :event_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.integer :role

      t.timestamps
    end
  end
end
