class CreateArtists < ActiveRecord::Migration
  def change
    create_table :artists do |t|
      t.string :name
      t.string :website
      t.string :wikipedia
    end
  end
end