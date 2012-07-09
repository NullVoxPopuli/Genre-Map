class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		genres = Genre.all

 		@connections = []
 		@nodes = []


 		Genre.all.each {|g| 
 			node = {
	 			:name => g[:id],
	 			:kind => g.kind_key,
	 			:super_genre => g.super_genre ? g.super_genre.name : "",
	 			:data => g.as_json
 		 	}
 		 	@nodes << node
 		 	
 		 	g_index = genres.index(g)
 			@connections << {:source => node, :target => node} if g.stylistic_origin_ids.empty?
 			g.stylistic_origins.each {|o|
 				o_index = genres.index(o)
 				@connections << {
 					:source => o_index,
        	  		:target => g_index,
          			:rel => "direct" 
          		}
			}
		}

 		@nodes = @nodes.to_json
 		@connections = @connections.to_json
 		@hidden_genres = Genre.find(:all, :conditions => ["kind = ?", Genre::SUPER_GENRE], :select => "name").map{|g| g.name}.to_json
 	end

protected
	def create_toolbar
		@toolbar = {
			:home => "/",
			:artists => artists_url,
			:tracks => tracks_url,
			:geners => genres_url,
			:new_artist => new_artist_url,
			:new_track => new_track_url,
			:new_genre => new_genre_url
		}
	end

end
