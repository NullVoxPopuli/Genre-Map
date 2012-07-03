class Genre < ActiveRecord::Base
  	attr_accessible :cultural_origins, 
  				  	:description, 
  				  	:direct_influence_ids, 
  				  	:name,
  				  	:aka,
  				  	:track_ids,
  				  	:partial_influences, 
  				  	:time_of_inception
  				  	
  	has_and_belongs_to_many :tracks, 
                            :join_table => 'genres_tracks',
                            :foreign_key => "genre_id"
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

    def as_json(options = {})
      self.attributes.merge({
        :direct_influences => self.direct_influence_ids,
        :tracks => self.tracks.map {|t|
          t.attributes.merge!({
            :artist => t.artist.attributes
          })
        }
      })
    end
end
