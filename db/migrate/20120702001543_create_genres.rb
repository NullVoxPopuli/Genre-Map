class CreateGenres < ActiveRecord::Migration
  def change
    create_table :genres do |t|
      t.string :name
      t.string :aka
      t.text :description
      t.date :time_of_inception
      t.string :cultural_origins
      t.string :wikipedia
    end
  end
end
