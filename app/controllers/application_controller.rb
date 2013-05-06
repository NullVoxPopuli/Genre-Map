class ApplicationController < ActionController::Base
 	protect_from_forgery

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

end
