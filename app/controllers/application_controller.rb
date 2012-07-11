class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		genres = Genre.all

 		@connections = []
 		@nodes = []


 		Genre.all.each {|g| 
 			node = {
	 			:id => g[:id],
	 			:name => g[:name],
	 			:kind => g.kind_key,
	 			:category => g.category ? g.category.name : "",
	 			:super_genre => g.super_genre ? g.super_genre.name : "",
	 			:data => g.as_json
 		 	}
 		 	@nodes << node
 		 	
 		 	g_index = genres.index(g)
 		 	origins = g.stylistic_origins

 			@connections << {:source => node[:id], :target => node[:id]} if origins.empty?
 			origins.each {|o|
 				@connections << {
 					:source => o[:id],
        	  		:target => g[:id]
           		}
			}
		}

 		@nodes = @nodes.to_json
 		@connections = @connections.to_json
 		@super_genres = Genre.find(:all, :conditions => ["kind = ?", Genre::SUPER_GENRE], :select => "name").map{|g| g.name}.to_json
 		@categories = Category.all.to_json
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
