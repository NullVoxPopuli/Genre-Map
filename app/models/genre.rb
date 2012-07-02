class Genre < ActiveRecord::Base
  	attr_accessible :cultural_origins, 
  				  	:description, 
  				  	:direct_influences, 
  				  	:name,
  				  	:aka,
  				  	:partial_influences, 
  				  	:time_of_inception
  				  	
  	has_and_belongs_to_many :tracks
  	has_and_belongs_to_many :direct_influences,
                          	:class_name => 'Genre',
                          	:join_table => 'genres_direct_influences',
                          	:foreign_key => 'genre_id',
                          	:association_foreign_key => 'direct_influence_id'
    has_and_belongs_to_many :partial_influences,
                          	:class_name => 'Genre',
                          	:join_table => 'genres_partial_influences',
                          	:foreign_key => 'genre_id',
                          	:association_foreign_key => 'partial_influence_id'


    validates_presence_of :name
end
