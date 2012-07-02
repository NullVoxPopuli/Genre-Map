class Track < ActiveRecord::Base
  	attr_accessible :artist_id, 
  					:link, 
  					:name

  	has_and_belongs_to_many :genres,
  							:join_table => "genres_tracks",
  							:foreign_key => "track_id"
  	belongs_to :artist

  	validates_presence_of :artist_id
  	validates_presence_of :name
  	validates_presence_of :link
end
