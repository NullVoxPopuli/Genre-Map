class RemoveTimeOfInceptionAndAddDecade < ActiveRecord::Migration
  def up
  	add_column :genres, :decade, :string
  	remove_column :genres, :time_of_inception
  end

  def down
 	remove_column :genres, :decade
  	add_column :genres, :time_of_inception, :date
  end
end
