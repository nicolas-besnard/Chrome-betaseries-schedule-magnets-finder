console.log("Load extension");

var Database = {
	addEpisode: function(episode, leechers, seeders, magnet)
	{
		console.log("addEpisode", episode);
		localStorage[episode +'-leechers'] = leechers;
		localStorage[episode +'-seeders'] = seeders;
		localStorage[episode +'-magnet'] = magnet;
		localStorage[episode +'-date'] = Math.floor((Date.now() / 1000));
	},

	episodeIsDefine: function(episode)
	{
		// Magnet exist
		if (episode +'-magnet' in localStorage)
		{
			// Magnet is not more than 1 days old (86400 secs)
			if (Math.floor(Date.now() / 1000) - localStorage[episode +'-date'] < 86400)
			{
				return true;
			}
		}
		return false;
	},

	getEpisode: function(episode)
	{
		return {
			"magnet": localStorage[episode +'-magnet'],
			"seeders": localStorage[episode +'-seeders'],
			"leechers": localStorage[episode +'-leechers'],
		};
	}
};

function Episode(episode, serieName, thisEpisode)
{
	this.episode = episode;
	this.serieName = serieName;
	this.thisEpisode = thisEpisode;
};

Episode.prototype.getMagnet = function()
{
	if (this.isViewed() == false)
	{
		this.fetchMaget();
	}
};

Episode.prototype.isViewed = function()
{
	return this.episode.find('.side .markas_img').length == 0;
};

Episode.prototype.fetchMaget = function()
{
	if (Database.episodeIsDefine(this.serieName + this.thisEpisode))
	{
		var episode = Database.getEpisode(this.serieName + this.thisEpisode);

		this.setHTML(episode['magnet'], episode['seeders'], episode['leechers']);
	}
	else
	{
		var that = this;

		$.get('http://pirateproxy.ws/search/'+ this.serieName +' '+ this.thisEpisode +'/0/7/208', function(data)
		{
			var doc = $(data);
			var magnet = doc.find('a[title="Download this torrent using magnet"]').first();
			var seeders = $(magnet.parents('tr').find('td[align=right]')[0]).html();
			var leechers = $(magnet.parents('tr').find('td[align=right]')[1]).html();

			Database.addEpisode(that.serieName + that.thisEpisode, seeders, leechers, magnet);

			that.setHTML(magnet.attr('href'), seeders, leechers);
		});
	}
};

Episode.prototype.setHTML = function(magnet, seeders, leechers)
{
	this.episode.find('.srtlinks').append('<a href="' + magnet + '"> Télécharger le torrent ↓</a> (<span style="color: #008f0d;">' + seeders + '</span> / <span style="color: #b94309;">' + leechers + '</span>)');
};

var handleEpisodes = function($listOfEpisodes)
{
	for (var i = 0; i < $listOfEpisodes.length; ++i)
	{
		var episode = $($listOfEpisodes[i]);
		var serieName = episode.find('.titre .ep').html();
		var thisEpisode = episode.find('.titre .ep').next().html();

		var my = new Episode(
			episode,
			serieName,
			thisEpisode,
			i
		);
		my.getMagnet();
		if (i == 3)
			break;
	}
}

var episodes_search_is_launched = false

var observer = new MutationObserver(function(mutations)
{
	mutations.forEach(function(mutation) {
		if ($('#planning_container .episodes').length >= 1 && !episodes_search_is_launched)
		{
			var episodesLastWeek = $($('#planning_container .episodes h2')[0]).nextUntil('.clear')
			var episodesThisWeek = $($('#planning_container .episodes h2')[1]).nextUntil('.clear')

			handleEpisodes(episodesLastWeek);
			// handleEpisodes(episodesThisWeek);

			episodes_search_is_launched = true;
		}
	});
});

observer.observe(document.getElementById('planning_container'), {
    childList: true,
  	subtree: true,
  	attributes: false,
  	characterData: false
})