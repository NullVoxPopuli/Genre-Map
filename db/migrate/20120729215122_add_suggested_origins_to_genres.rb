class AddSuggestedOriginsToGenres < ActiveRecord::Migration
	def self.up
    	add_column :genres, :suggested_origins, :text
  	end

  	def self.down
    	remove_column :genres, :suggested_origins
  	end
end
