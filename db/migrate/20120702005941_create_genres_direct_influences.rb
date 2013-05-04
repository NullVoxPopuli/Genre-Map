class CreateGenresDirectInfluences < ActiveRecord::Migration
	def up
  		create_table :genres_influencing_genres, :id => false do |t|
        	t.integer :genre_id
        	t.integer :influencing_genre_id
    	end
    	add_index :genres_influencing_genres, 
    				[:genre_id, :influencing_genre_id],
            :name => "genre_id_influencing_genres_index"
    	add_index :genres_influencing_genres, 
    				[:influencing_genre_id, :genre_id],
            :name => "influencing_genre_id_genres_index"
  end

	def down
 		drop_table :genres_influencing_genres
 	end
end
