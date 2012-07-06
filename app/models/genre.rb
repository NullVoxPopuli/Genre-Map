class Genre < ActiveRecord::Base
  	attr_accessible :cultural_origins, 
  				  	:description, 
  				  	:stylistic_origin_ids,
              :child_ids,
  				  	:name,
  				  	:aka,
              :kind,
  				  	:track_ids,
  				  	:time_of_inception,
              :super_genre_id,
              :wikipedia
  	
    belongs_to :super_genre,
                :class_name => "Genre",
                :foreign_key => "super_genre_id"

  	has_and_belongs_to_many :tracks, 
                            :join_table => 'genres_tracks',
                            :foreign_key => "genre_id"
  	has_and_belongs_to_many :stylistic_origins,
                          	:class_name => 'Genre',
                          	:join_table => 'genres_stylistic_origins',
                          	:foreign_key => 'genre_id',
                          	:association_foreign_key => 'stylistic_origin_id'
    has_and_belongs_to_many :childs,
                            :class_name => "Genre",
                            :join_table => "genres_stylistic_origins",
                            :foreign_key => "stylistic_origin_id",
                            :association_foreign_key => "genre_id"
   
    SUB_GENRE = 0 # or nil
    SUPER_GENRE = 1
    NON_ELECTRONIC = 2

    def self.kinds
      return {:sub_genre => SUB_GENRE, :super_genre => SUPER_GENRE,
        :non_electronic => NON_ELECTRONIC}
    end

    def kind_name
      result = ""
      result = "Sub Genre" if self.kind == SUB_GENRE
      result = "Super Genre" if self.kind == SUPER_GENRE
      return result
    end


    validates_presence_of :name
    validates :time_of_inception, :numericality => { :only_integer => true, :allow_nil => true }

    def as_json(options = {})
      self.attributes.merge({
        :stylistic_origin_ids => self.stylistic_origin_ids,
        :tracks => self.tracks.map {|t|
          t.attributes.merge!({
            :artist => t.artist.attributes
          })
        }
      })
    end

    def connections_as_json(options = {})
      result = []
      self.stylistic_origin_ids.each { |o_id|
        result << {
          :source => o_id,
          :target => self[:id],
          :type => "direct" 
        }
      }
      return result
    end
end
