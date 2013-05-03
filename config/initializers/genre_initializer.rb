class GenreInitializer
	require 'open-uri'
	require 'nokogiri'
	
	# scrape the http://en.wikipedia.org/wiki/List_of_electronic_music_genres page

	LIST = "http://en.wikipedia.org/wiki/List_of_electronic_music_genres"

	def self.scrape
		doc = Nokogiri::HTML( open( LIST ) )

		# select the top level genre of the genre list
		# at the time of writing this scraper, the genre list is formatted
		# like this:
		#  div
		#    ul
		#      li - container
		#        a - genre name
		#        ul - sub genres
		main_genres_uls = doc.css("#mw-content-text > div > ul")
		scrape_helper(main_genres_uls)
	end

	# iterate through, grabbing the names and URLs of the main genres
	def self.scrape_helper(parent_elements, parent_genre = 0)
		parent_elements.each do |ul|
			container = ul.css("> li")
			# link is the parent genre
			container.each do |con|
				link = con.css("> a")
				genre_url = link.attribute("href")
				genre_title = link.inner_html.titleize.gsub(" Music", "")	
				ap ("     " * parent_genre) + genre_title
				# create genre

				sub_genres = con.css("> ul")
				# repeat
				scrape_helper(sub_genres, (parent_genre + 1))
			end
		end
	end
end