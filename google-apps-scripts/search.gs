function searchSheet(input)
{
  try
  {
    if (input.length == 11)
      var type = "videoId";
    else
      var type = "videoTitle";

    var channels = ["SiIvaGunner",
                    "TimmyTurnersGrandDad",
                    "VvvvvaVvvvvvr",
                    "Flustered Fernando",
                    "GiIvaSunner Reuploads",
                    "SiIvaGunner2",
                    "SiLvaGunner"];

    for (var i in channels)
    {
      var channelSheet = spreadsheet.getSheetByName(channels[i]);

      if (type == "videoId")
        var values = channelSheet.getRange(2, 1, channelSheet.getLastRow() - 1).getValues();
      else
        var values = channelSheet.getRange(2, 2, channelSheet.getLastRow() - 1).getValues();

      var index = values.findIndex(ids => {return ids[0] == input});

      if (i == channels.length - 1 && index == -1)
        return "Video not found.";
      else if (index != -1)
        break;
    }

    var data = channelSheet.getRange(index + 2, 1, 1, 7).getValues();

    var videoId = data[0][0];
    var videoTitle = data[0][1];
    var wikiStatus = data[0][2];
    var videoStatus = data[0][3];
    var uploadDate = formatDate(data[0][4]);
    var length = formatLength(data[0][5]);
    var description = data[0][6].replace(/NEWLINE/g, "\n");

    switch(channels[i])
    {
      case "SiIvaGunner":
      case "SiIvaGunner2":
      case "GiIvaSunner Reuploads":
        var wikiUrl = "https://siivagunner.fandom.com/wiki/" + formatWikiLink(videoTitle);
        break;
      case "TimmyTurnersGrandDad":
        var wikiUrl = "https://ttgd.fandom.com/wiki/" + formatWikiLink(videoTitle);
        break;
      case "VvvvvaVvvvvvr":
        var wikiUrl = "https://vvvvvavvvvvr.fandom.com/wiki/" + formatWikiLink(videoTitle);
        break;
      case "Flustered Fernando":
        var wikiUrl = "https://flustered-fernando.fandom.com/wiki/" + formatWikiLink(videoTitle);
        break;
      default:
        var wikiUrl = "No associated wiki";
    }

    var archiveUrl = "https://web.archive.org/web/*/https://www.youtube.com/watch?v=" + videoId;

    var status = "";
    status += "Archive link: <a target=\"_blank\" href=\"" + archiveUrl + "\">Wayback Machine</a>";
    status += "<br/>Upload date: " + uploadDate;
    status += "<br/>Video length: " + length;
    status += "<br/>Video status: " + videoStatus;

    if (wikiStatus == "Documented" || wikiStatus == "Undocumented")
      status += "<br/>Wiki status: <a target=\"_blank\" href=\"" + wikiUrl + "\">" + wikiStatus + "</a>";
    else
      status += "<br/>Wiki status: " + wikiUrl;

    return [videoId, status, description].join("SEPARATOR");
  }
  catch(e)
  {
    return e;
  }
}
