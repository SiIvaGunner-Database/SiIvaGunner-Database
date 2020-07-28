function generateTemplate(videoId, format)
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");

  if (videoId == "")
    return "Please enter a video URL or ID.";
  else if (videoId.length != 11)
    return "Invalid video URL or ID: " + videoId;

  var playlistId = "";
  var uploadDate = "";
  var length = "";
  var description = "";
  var pageName = "";
  var mix = "";
  var track = "";
  var simplifiedTrack = "";
  var composer = "";
  var composerLabel = "";
  var platform = "";
  var platformLabel = "";
  var ripper = "";
  var catchphrase = "";
  var game = "";

  try
  {
    try
    {
      // Fetch the video details.
      var results = YouTube.Videos.list('id,snippet,contentDetails',
                                        {
                                          id: videoId,
                                          maxResults: 1,
                                          type: 'video'
                                        });

      results.items.forEach(function(item)
                            {
                              pageName = item.snippet.title.toString();
                              description = item.snippet.description.toString().replace(/\r/g, "");
                              uploadDate = item.snippet.publishedAt.toString();
                              length = item.contentDetails.duration.toString();
                            });
    }
    catch(e)
    {
      // In case the YouTube API quota has been passed.
      var values = channelSheet.getRange(2, 3, 20).getValues();
      var row = values.findIndex(ids => {return ids[0] == videoId});
      if (row == -1)
      {
        var values = channelSheet.getRange(21, 3, channelSheet.getLastRow() - 20).getValues();
        var row = values.findIndex(ids => {return ids[0] == videoId});

        if (row == -1)
          return "Video not found.";
        else
          var data = channelSheet.getRange(row + 21, 1, 1, 7).getValues();
      }
      else var data = channelSheet.getRange(row + 2, 1, 1, 7).getValues();

      pageName = data[0][0];
      uploadDate = data[0][3];
      length = data[0][4];
      description = data[0][5].replace(/NEWLINE/g, "\n");
    }

    // Add labels if needed.
    if (description.indexOf("Composers: ") != -1)
    {
      description = description.replace("Composers: ", "Composer: ");
      composerLabel = "\n|composer label\t= Composers";
    }
    else if (description.indexOf("Composer(s): ") != -1)
    {
      description = description.replace("Composer(s): ", "Composer: ");
      composerLabel = "\n|composer label\t= Composer(s)";
    }
    else if (description.indexOf("Arrangement: ") != -1)
    {
      description = description.replace("Arrangement: ", "Composer: ");
      composerLabel = "\n|composer label\t= Arrangement";
    }
    else if (description.indexOf("Arrangers: ") != -1)
    {
      description = description.replace("Arrangers: ", "Composer: ");
      composerLabel = "\n|composer label\t= Arrangers";
    }
    else if (description.indexOf("Composed by: ") != -1)
    {
      description = description.replace("Composed by: ", "Composer: ");
      composerLabel = "\n|composer label\t= Composed by";
    }

    if (description.indexOf("Platforms: ") != -1)
    {
      description = description.replace("Platforms: ", "Platform: ");
      platformLabel = "\n|platform label\t= Platforms";
    }

    // Use regular expressions to get the necessary information from the description.
    var playlistIdPattern = new RegExp("Playlist: (.*)\n");
    var composerPattern = new RegExp("Composer: (.*)\n");
    var platformPattern = new RegExp("Platform: (.*)\n");

    if (description.indexOf("\n\n") != -1)
      var ripperPattern = new RegExp("Ripper: (.*)\n");
    else
    {
      var ripperPattern = new RegExp("Ripper: (.*)");
      catchphrase = "\n|catchphrase\t= ";
    }

    description = description.replace(/,/g, "COMMA");

    if (description.indexOf("Playlist: ") != -1)
      playlistId = playlistIdPattern.exec(description).toString().split(",").pop();

    if (description.indexOf("Ripper: ") != -1)
      ripper = ripperPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

    if (description.indexOf("Composer: ") != -1)
      composer = "\n|composer\t= " + composerPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

    if (description.indexOf("Platform: ") != -1)
      platform = "\n|platform\t= " + platformPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

    if (description.indexOf("Please read the channel description.") == -1 && description.indexOf("\n\n") != -1)
      catchphrase = "\n|catchphrase\t= " + description.split("\n\n").pop();

    // Format the video length, adding zeroes if needed.
    for (var i = 0; i < length.length; i++)
    {
      if (length.charAt(i) == "T" && length.charAt(i+2) == "S")
        length = length.replace("PT", "0:0");
      else if (length.charAt(i) == "T" && length.charAt(i+3) == "S")
        length = length.replace("PT", "0:");
      else if (length.charAt(i) == "M" && length.charAt(i+2) == "S")
        length = length.replace("M", ":0");
      if (length.charAt(i) == "H" && length.charAt(i+2) == "M")
        length = length.replace("H", ":0");
    }

    length = length.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "");

    // Format the upload date.
    uploadDate = Utilities.formatDate(new Date(uploadDate), "UTC", "MMMM d, yyyy");

    // Seperate the rip title into four parts: full title, song title, game title, and mix.
    pageName = pageName.split(" - ");

    for (i = 0; i < pageName.length - 1; i++)
    {
      track += pageName[i] + " - ";
      game = pageName[i+1];
    }

    pageName = pageName.join(" - ");
    track = track.substring(0, track.length - 3);
    simplifiedTrack = track;

    if (track.indexOf("(") != -1 && (track.indexOf("Mix)") != -1 || track.indexOf("Version)") != -1))
    {
      var simplifiedTrackPattern = new RegExp(/(.*) \(/);
      track = track.replace(/,/g, "COMMA");
      simplifiedTrack = simplifiedTrackPattern.exec(track).toString().split(",").pop().replace(/COMMA/g, ",");
      simplifiedTrack = simplifiedTrack.replace(/COMMA/g, ",");
      track = track.replace(/COMMA/g, ",");

      mix = track.replace(simplifiedTrack + " ", "").replace(/\(/g, "of the ").replace(/\)/g, " ").replace(/Mix/g, "mix").replace(/Version/g, "version");
    }

    // Build the template.
    var val = "{{Rip" +
              "\n|image\t\t= " + game + ".jpg" +
              "\n" +
              "\n|link\t\t= " + videoId +
              "\n|playlist\t= " + game +
              "\n|playlist id\t= " + playlistId.replace(/h.*=/, "") +
              "\n|upload\t\t= " + uploadDate +
              "\n|length\t\t= " + length +
              "\n|author\t\t= " + ripper +
              "\n" +
              "\n|album\t\t= " +
              "\n|track\t\t= " +
              "\n" +
              "\n|music\t\t= " + track +
              /* "\n|composer\t= " + */ composer +
              /* "\n|composer label\t= " + */ composerLabel +
              /* "\n|platform\t= " + */ platform +
              /* "\n|platform label\t= " + */ platformLabel +
              /* "\n|catchphrase\t= " + */ catchphrase +
              "\n}}" +
              "\n\"'''" + pageName + "'''\" is a high quality rip " + mix +
              "of \"" + simplifiedTrack + "\" from ''" + game + "''." +
              "\n== Jokes ==";

    if (format == "single")
      val = val.replace(/\t\t= |\t= /g, "= ");
    else if (format == "double")
      val = val.replace(/\t\t= |\t= /g, " = ");
    else if (format == "none")
      val = val.replace(/\t\t= |\t= /g, "=");
  }
  catch(e)
  {
    return e;
  }

  return val;
}
