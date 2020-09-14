function searchSheet(input)
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");

  if (input.length == 11)
    var type = "videoId";
  else
    var type = "videoTitle";

  var status = "";
  var description = "";

  try
  {
    if (type == "videoId")
      var values = channelSheet.getRange(2, 1, channelSheet.getLastRow() - 1).getValues();
    else
      var values = channelSheet.getRange(2, 2, channelSheet.getLastRow() - 1).getValues();

    var index = values.findIndex(ids => {return ids[0] == input});

    if (index == -1)
      return "Video not found.";
    else
      var data = channelSheet.getRange(index + 2, 1, 1, 7).getValues();

    var videoId = data[0][0];
    var videoTitle = data[0][1];
    var wikiStatus = data[0][2];
    var videoStatus = data[0][3].toLowerCase();
    var uploadDate = formatDate(data[0][4]);
    var length = formatLength(data[0][5]);
    var description = data[0][6].replace(/NEWLINE/g, "\n");

    var wikiUrl = "https://siivagunner.fandom.com/wiki/" + formatWikiLink(videoTitle);
    var archiveUrl = "https://web.archive.org/web/*/https://www.youtube.com/watch?v=" + videoId;

    status += "Archive link: <a target=\"_blank\" href=\"" + archiveUrl + "\">Wayback Machine</a>";
    status += "<br/>Upload date: " + uploadDate;
    status += "<br/>Video length: " + length;
    status += "<br/>Video status: " + videoStatus;

    if (wikiStatus == "Documented")
      status += "<br/>Wiki status: <a target=\"_blank\" href=\"" + wikiUrl + "\">documented</a>";
    else
      status += "<br/>Wiki status: <a target=\"_blank\" href=\"" + wikiUrl + "\">undocumented</a>";
  }
  catch(e)
  {
    return e;
  }

  return [videoId, status, description].join("SEPARATOR");
}
