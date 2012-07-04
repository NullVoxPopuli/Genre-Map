class CreateGenresDirectInfluences < ActiveRecord::Migration
	def up
  		create_table :genres_direct_influences, :id => false do |t|
        	t.integer :genre_id
        	t.integer :direct_influence_id
    	end
    	add_index :genres_direct_influences, 
    				[:genre_id, :direct_influence_id], 
    				:name => :direct_inflence_index
    	add_index :genres_direct_influences, 
    				[:direct_influence_id, :genre_id],
    				:name => :direct_influence_genre_index
 	end

  	def down
  		drop_table :genres_direct_influences
  	end
end
