class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		@genres = Genre.all
 		@data = {}
 		Genre.all.map{|g| @data.merge!({g[:id] => g.as_json})}
 		@data = @data.to_json
 		@connections = []
 		Genre.all.map{|g| 
 			@connections << {:source => g[:id], :target => g[:id]} if g.stylistic_origin_ids.empty?
 			g.stylistic_origin_ids.each {|id|
 				@connections << {
 					:source => id,
        	  		:target => g[:id],
          			:rel => "direct" }
 				}}
 		@connections = @connections.to_json
 		@nodes = []
 		 Genre.all.each {|g| 
 		 	@nodes << {
 		 			:name => g[:id],
 		 			:kind => g.kind_key
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
