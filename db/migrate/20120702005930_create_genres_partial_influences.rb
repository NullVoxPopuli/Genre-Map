class CreateGenresPartialInfluences < ActiveRecord::Migration
	def up
  		create_table :genres_partial_influences, :id => false do |t|
        	t.integer :genre_id
        	t.integer :partial_influence_id
    	end
    	add_index :genres_partial_influences, 
    				[:genre_id, :partial_influence_id],
    				:name => :genre_partial_influence_index
    	add_index :genres_partial_influences, 
    				[:partial_influence_id, :genre_id],
    				:name => :partial_influence_genre_index
  	end

  	def down
  		drop_table :genres_partial_influences
  	end
end
