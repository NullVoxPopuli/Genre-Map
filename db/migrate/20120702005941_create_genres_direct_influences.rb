class CreateGenresDirectInfluences < ActiveRecord::Migration
	def up
  		create_table :genres_direct_influences, :id => false do |t|
        	t.references :genre
        	t.references :genres_direct_influence
    	end
    	add_index :genres_direct_influences, 
    				[:genre_id, :genres_direct_influence_id], 
    				:name => :genre_direct_inflence_index
    	add_index :genres_direct_influences, 
    				[:genres_direct_influence_id, :genre_id],
    				:name => :direct_influence_genre_index
 	end

  	def down
  		drop_table :genres_direct_influences
  	end
end
