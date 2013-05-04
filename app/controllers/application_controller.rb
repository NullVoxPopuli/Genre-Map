class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		genres = Genre.where("parent_genre_id IS NULL")

 		# @nodes = []
 		# @connections = []
 		@tree = []

 		genres.each do |genre|
			# node = {
 		# 		id: genre.id,
 		# 		url: genre.wikipedia
 		# 	}
 		# 	@nodes << node

 			@tree << genre.recursive_to_hash
 			ap @tree
 		end
 		@tree = @tree[0].to_json

 		respond_to do |format|
 			format.html { }
 			format.js { }
 		end
 	end

 	def wiki
 		redirect_to "http://en.wikipedia.org/wiki/" + params[:page]
 	end

protected
	def create_toolbar
		@toolbar = {
			:home => "/",
			:artists => artists_url,
			:tracks => tracks_url,
			:geners => genres_url,
			:categories => categories_url,
			:new_artist => new_artist_url,
			:new_track => new_track_url,
			:new_genre => new_genre_url,
			:new_category => new_category_url
		}
	end

end
