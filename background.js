function Episode(episode, serieName, thisEpisode)
{
	this.episode = episode;
	this.serieName = serieName;
	this.thisEpisode = thisEpisode;
};

Episode.prototype.getMagnet = function()
{
	console.log("getMagnet", this.isViewed());
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
	var that = this;
	console.log(this.episode);
	$.get('http://pirateproxy.ws/search/'+ this.serieName +' '+ this.thisEpisode +'/0/7/208', function(data)
	{
		var doc = $(data);
		var magnet = doc.find('a[title="Download this torrent using magnet"]').first();
		var seeders = $(magnet.parents('tr').find('td[align=right]')[0]).html();
		var leechers = $(magnet.parents('tr').find('td[align=right]')[1]).html();
		that.episode.find('.srtlinks').append('<a href="' + magnet.attr('href') + '"> Télécharger le torrent ↓</a> (<span style="color: #008f0d;">' + seeders + '</span> / <span style="color: #b94309;">' + leechers + '</span>)');
	});
};

var handleEpisodes = function($listOfEpisodes)
{
	for (var i = 0; i < $listOfEpisodes.length; ++i)
	{
		var episode = $($listOfEpisodes[i]);
		var serieName = episode.find('.titre .ep').html();
		var thisEpisode = episode.find('.titre .ep').html();

		var my = new Episode(
			episode,
			serieName,
			thisEpisode,
			i
		);
		my.getMagnet();
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
			handleEpisodes(episodesThisWeek);

			episodes_search_is_launched = true;
		}
	});
});

observer.observe(document.getElementById('planning_container'), {
    childList: true
  , subtree: true
  , attributes: false
  , characterData: false
})