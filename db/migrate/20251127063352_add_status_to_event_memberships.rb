class AddStatusToEventMemberships < ActiveRecord::Migration[7.2]
  def change
    add_column :event_memberships, :status, :string
  end
end
