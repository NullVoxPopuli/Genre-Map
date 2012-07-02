class CreateGenresTracksTable < ActiveRecord::Migration
	def self.up
    	create_table :genres_tracks, :id => false do |t|
        	t.references :genre
        	t.references :track
    	end
    	add_index :genres_tracks, [:genre_id, :track_id]
    	add_index :genres_tracks, [:track_id, :genre_id]
  	end

  	def self.down
    	drop_table :genres_tracks
  	end
end
