class CreateEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :events do |t|
      t.string :title
      t.string :location
      t.datetime :date
      t.string :description

      t.timestamps
    end
  end
end
