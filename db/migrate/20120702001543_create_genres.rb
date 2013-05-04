class CreateGenres < ActiveRecord::Migration
  def change
    create_table :genres do |t|
      t.string :name
      t.integer :kind
      t.string :wikipedia

      t.references :parent_genre
    end
  end
end
