class ApplicationController < ActionController::Base
 	protect_from_forgery

 	before_filter :create_toolbar

 	def index
 		genres = Genre.all

 		@connections = []
 		@nodes = []
 		@years_by_genre = {}

 		Genre.find(:all, :conditions => ["kind != ?", Genre::SUPER_GENRE]).each {|g| 
 			super_genre_name = g.super_genre ? g.super_genre.name : ""

 			if !g.time.blank? and !g.time.nil? and !g.is_super_genre?
 				ap super_genre_name
 				ap g
 				ap @years_by_genre
 				@years_by_genre[super_genre_name] = [] if (not @years_by_genre[super_genre_name])
 				@years_by_genre[super_genre_name] << g.time.year
 			end

 			node = {
	 			:id => g[:id],
	 			:name => g[:name],
	 			:kind => g.kind_key,
	 			:year => g.time ? g.time.year : "",
	 			:category => g.category ? g.category.name : "",
	 			:super_genre => super_genre_name,
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
 		@super_genres = Genre.find(:all, :conditions => ["kind = ?", Genre::SUPER_GENRE], :select => "name")
 		@super_genres_json = @super_genres.map{|g| g.name}.to_json
 		@categories = Category.all.to_json
 		@years_by_genre = @years_by_genre.to_json
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
