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
        console.log("getMagnet");
        if (this.isViewed() == false)
        {
          console.log("do fetch");
          this.fetchMaget();
        }
      };

      Episode.prototype.isViewed = function() {
        return this.episode.find('.side .markas_img').length > 0;
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


          var getFirst = function (elems, cb) {
            var data = null;

            $.each(elems, function(index, elem) {
              if (cb(index, elem)) {
                data = $(elem);
                return false;
              }
            });

            var title = $(data.find('td')[0]).find('a.cellMainLink').text();
            var magnet = $(data.find('td div')[0]).find('a[href*="magnet"]').attr('href');
            var seeders = $(data.find('td')[4]).text();
            var leechers = $(data.find('td')[5]).text();

            return [{
              title: title,
              magnet: magnet,
              seeders: seeders,
              leechers: leechers
            }]
          };

          var handleSearchResult = function (data) {
            var doc = $(data); 
            var elems = doc.find("#mainSearchTable table tr");

      // elems = getFirst(elems, function(index, elem) { return index == 1 });
      elems = getFirst(elems, function (index, elem) {
        var text = $($(elem).find('td')[0]).find('a.cellMainLink').text();
        var find = text.indexOf("720") >= 0;

        return find;
      });

      $.each(elems, function(_, elem) {
        Database.addEpisode(that.serieName + that.thisEpisode, elem.seeders, elem.leechers, elem.magnet);

        that.setHTML(elem.magnet, elem.seeders, elem.leechers);  
      })
    };

    $.get('https://kat.cr/usearch/'+ this.serieName +' '+ this.thisEpisode, handleSearchResult);
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
    var serieName = episode.find('.ep').html();
    var thisEpisode = episode.find('.ep').next().html();

    console.log(serieName);
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

      var episodesLastWeek = $($('#planning_container .episodes h2')[0]).nextUntil('h2')
      var episodesThisWeek = $($('#planning_container .episodes h2')[1]).nextUntil('h2')

      handleEpisodes(episodesLastWeek);
      handleEpisodes(episodesThisWeek);

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