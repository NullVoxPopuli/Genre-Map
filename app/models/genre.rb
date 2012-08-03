class Genre < ActiveRecord::Base
  	attr_accessible :cultural_origins, 
  				  	:description, 
  				  	:stylistic_origin_ids,
              :child_ids,
  				  	:name,
  				  	:aka,
              :kind,
  				  	:track_ids,
              :super_genre_id,
              :wikipedia,
              :category_id,
              :suggested_origins,
              :decade
  	
    belongs_to :super_genre,
                :class_name => "Genre",
                :foreign_key => "super_genre_id"

    belongs_to :category

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
    ELECTRONIC = 3

    validates :name, :uniqueness => {:case_sensitive => false}
    validates_presence_of :name


    def self.kinds
      return {:sub_genre => SUB_GENRE, :super_genre => SUPER_GENRE,
        :non_electronic => NON_ELECTRONIC}
    end

    def kind_key
      return Genre.kinds.key(self.kind)
    end

    def is_super_genre?
      return (SUPER_GENRE == self.kind)
    end

    def kind_name
      result = ""
      result = "Sub Genre" if self.kind == SUB_GENRE
      result = "Super Genre" if self.kind == SUPER_GENRE
      return result
    end

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

    def set_wiki_info!; self.scrape_information_from_wiki(true); end
    def scrape_information_from_wiki(wiki = self.wikipedia, save_when_done = false)
      origins = []
      description = []
      name = ""
      decade = ""
      p = open(wiki) {|f| Hpricot(f)} 

      # remove citations, as we don't display the entire wiki page
      (p/:sup/:a).remove

      # scan the page for the stylistic origins
      (p/".infobox th").each {|a| 
        if a.inner_html == "Stylistic origins" 
         origin_genres = a.next_sibling
         origin_genres = origin_genres.search("/a")
         origin_genres.each {|g|
          origins << g.inner_html
         }
        end 
      }

      # scan the page for the title
      name = (p/"#firstHeading span").inner_html.titleize

      # scan the page for the description / summary
      # there are several types of descriptions 
      #
      # 1. The Easy
      #   - http://en.wikipedia.org/wiki/Ambient_music
      #   Has an info box on the right hand side with a summary 
      #   of the origins of the genre
      #
      # 2. The Sub / Derivitive / Fusion Genre (doesn't get it's own page)
      #   - http://en.wikipedia.org/wiki/Ambient_dub#Ambient_dub
      #   these have a #name to jump to a specific ID on the page.
      #   these are often short descriptions about something that evolved
      #   out of the parent genre, but isn't that big of a deal
      #
      # 3. The Super Generic Overview - Not really a Genre, but more a sound
      #   - http://en.wikipedia.org/wiki/Psychedelic_music
      #   No info box on the right
      #   - need to get get info prior to table of contents (table.toc#toc)
      if (i = wiki.index("#")) != nil
        # try method 2  
        id = wiki[i..wiki.length - 1]
        # get the proper name
        name = (p/"#{id}").inner_html
        # only get the first sibling of the parent element of the title (which is an h2)
        description << (p/"#{id}")[0].parent.next_sibling.inner_html
      else
        # try method 1
        (p/".infobox").each {|i| 
          current_sibling = i.next_sibling
          # gets the first description at the top of the wiki
          # article
          while (current_sibling and current_sibling.pathname != "p")
            current_sibling = current_sibling.next_sibling
          end

          # loop through until we hit something not a "p" tag
          while (current_sibling and current_sibling.pathname == "p")
            description << current_sibling.to_html
            current_sibling = current_sibling.next_sibling
          end
        }
      end

   

      # scan the page for the decade
      decade = ""
      (p/".infobox th").each {|a| 
        if a.inner_html == "Cultural origins" 
         decade = a.next_sibling.inner_html.match(/\d{0,4}s/).to_s
        end 
      }

      # set corresponding fields
      self.suggested_origins = ""
      origins.each {|o|
        self.suggested_origins += (o + "\n")
      }
      self.description = ""
      description.each {|d|
        self.description += d
      }

      self.name = name
      self.decade = decade

      success = true
      if save_when_done
        success = self.save
      end

      return success
    end
end
