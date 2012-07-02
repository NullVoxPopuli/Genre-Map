class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		@genres = Genre.all
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
