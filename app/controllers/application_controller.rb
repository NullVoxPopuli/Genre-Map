class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		genres = Genre.all

 		@connections = []
 		Genre.all.each{|g|
 			g_index = genres.index(g)
 			@connections << {:source => g_index, :target => g_index} if g.stylistic_origin_ids.empty?
 			g.stylistic_origins.each {|o|
 				o_index = genres.index(o)
 				@connections << {
 					:source => o_index,
        	  		:target => g_index,
          			:rel => "direct" }
 				}}
 		@connections = @connections.to_json

 		@nodes = []
 		 Genre.all.each {|g| 
 		 	@nodes << {
 		 			:name => g[:id],
 		 			:kind => g.kind_key,
 		 			:data => g.as_json
 		 		}
 		 	}
 		@nodes = @nodes.to_json
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
