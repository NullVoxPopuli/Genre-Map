class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		@genres = Genre.all
 		@data = {}
 		Genre.all.map{|g| @data.merge!({g[:id] => g.as_json})}
 		@connections = Genre.all.map{|g| g.connections_as_json}.flatten.to_json
 		@data = @data.to_json
 		@node_data = []
 		@genres.each { |g|
 			@node_data << {:name => g[:id],
 			 	:children => g.stylistic_origin_ids}
 		}
 		@node_data = {:name => "Electronic", :children => @node_data}.to_json
 		ap @node_data
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
