class Genesis
	require 'open-uri'
	require 'nokogiri'

	# scrape the http://en.wikipedia.org/wiki/List_of_electronic_music_genres page

	ELECTRONIC = "http://en.wikipedia.org/wiki/List_of_electronic_music_genres"

	def self.scrape
		doc = Nokogiri::HTML( open( ELECTRONIC ) )

		# create master electronic genre
		electronic_master_genre = Genre.new({
			name: "Electronic",
			wikipedia: "/wiki/Electronic_music"
		})
		electronic_master_genre.save! if electronic_master_genre.valid?

		# select the top level genre of the genre list
		# at the time of writing this scraper, the genre list is formatted
		# like this:
		#  div
		#    ul
		#      li - container
		#        a - genre name
		#        ul - sub genres
		main_genres_uls = doc.css("#mw-content-text > div > ul")
		scrape_helper(main_genres_uls, electronic_master_genre)
	end

	# iterate through, grabbing the names and URLs of the main genres
	def self.scrape_helper(parent_elements, parent_genre, depth = 0)
		parent_elements.each do |ul|
			container = ul.css("> li")
			# link is the parent genre
			container.each do |con|
				link = con.css("> a")
				genre_url = link.attribute("href")

				# I think it's silly that some of these genres have music in the title
				# on wikipedia. of course they're music.
				# actualyl... that may be debatable depending on the genre...
				genre_title = link.inner_html.titleize.gsub(" Music", "")

				# current genre
				ap ("     " * depth) + genre_title + " -- " + genre_url.content

				# create genre
				sub_genre = Genre.new({
					name: genre_title,
					wikipedia: genre_url.content
				})
				sub_genre.parent_genre = parent_genre if parent_genre
				sub_genre.save! if sub_genre.valid?

				sub_genres = con.css("> ul")
				# repeat
				scrape_helper(sub_genres, sub_genre, (depth + 1))
			end
		end
	end
end