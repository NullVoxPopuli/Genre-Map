class Genre < ActiveRecord::Base
  	attr_accessible :influencing_genre_ids,
              :derivitive_genre_ids,
  				  	:name,
              :kind,
              :parent_genre_id,
              :wikipedia
  	
    belongs_to :parent_genre,
                :class_name => "Genre",
                :foreign_key => "parent_genre_id"

    has_many :sub_genres, 
      :class_name => "Genre",
      :foreign_key => "parent_genre_id"

    alias_method :parent, :parent_genre
    alias_method :children, :sub_genres

  	has_and_belongs_to_many :influencing_genres,
    	:class_name => 'Genre',
    	:join_table => 'genres_influencing_genres',
    	:foreign_key => 'genre_id',
    	:association_foreign_key => 'influencing_genre_id'
  
    has_and_belongs_to_many :derivitive_genres,
      :class_name => "Genre",
      :join_table => "genres_influencing_genres",
      :foreign_key => "influencing_genre_id",
      :association_foreign_key => "genre_id"
   
    validates :name, :uniqueness => {:case_sensitive => false}
    validates_presence_of :name

    def recursive_to_hash(options = {})
      {
        id: id,
        name: name,
        wiki: wikipedia,
        _children: children.map{|c| c.recursive_to_hash}
      }
    end
end
