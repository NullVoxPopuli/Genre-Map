API_KEY = "0eb3d91af82caed046b26f328add99c4";
MAX_TRACKS = 10;

function getTracksForGenre(genre){
	$.ajax({
		type: "GET",
		url: "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks" + 
			"&tag=" + genre + 
			"&limit=50" +
			"&api_key=" + API_KEY + 
			"&format=json",
		success: function( data, textStatus,  jqXHR ){
			var tracks = data.toptracks.track;
			// populate genre info with tracks 
			var link, artistInfo, url, newArtist = false, hasEmbed = false;
			var examples = $(".examples");

			// clear the old tracks
			examples.html("");

			// maintain list of unique artists / bands
			// we don't want the same band showing up 5 times in 
			// a top 10 list
			uniqueArtists = [];

			// add the new tracks
			$.each(tracks, function(index, track){
				artistInfo = track.artist;

				if (uniqueArtists.length >= MAX_TRACKS){
					return;
				}

				// add track if artist hasn't been used yet
				newArtist = uniqueArtists.indexOf(artistInfo.name) < 0;
				hasEmbed = (track.streamable["#text"] || track.streamable.fulltrack);
				if (newArtist && hasEmbed){
					link = $(document.createElement("a"));
					link.html(artistInfo.name + " - '" + track.name +  "'");
					link.attr("href", track.url);
					link.attr("target", "_blank");

					examples.append(link);
					uniqueArtists.push(artistInfo.name);
				}
			
			});
		},
		complete: function(jqXHR, textStatus){
			// done
		}
	})
}

