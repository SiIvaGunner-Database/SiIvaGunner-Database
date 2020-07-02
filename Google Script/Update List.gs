// Update rip values and add missing rips.
function updateList()
{
  var startTime = new Date();
  var currentDate = startTime.getDate();
  var currentHour = startTime.getHours();
  var currentMinute = startTime.getMinutes();
  var summarySheet = spreadsheet.getSheetByName("Summary");
  var errorLog = [];
  var channel = "siiva";
  var taskId = 0;
  var ready = true;

  if (currentDate == 1 && currentHour >= 20 && currentMinute >= 30)
    channel = "ff";
  else if (currentDate % 14 == 0 && currentMinute >= 30)
    channel = "vavr";
  else if ((currentDate % 3 == 0 || currentHour == 0) && currentMinute >= 30)
    channel = "ttgd";

  if (channel == "siiva")
  {
    var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
    var channelId = "UC9ecwl3FTG66jIKA9JRDtmg";
    var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
    var wikiUrl = "https://siivagunner.fandom.com/wiki/";
    var summaryRow = 2;
  }
  else if (channel == "ttgd")
  {
    var channelSheet = spreadsheet.getSheetByName("TimmyTurnersGrandDad");
    var channelId = "UCIXM2qZRG9o4AFmEsKZUIvQ";
    var wikiUrl = "https://ttgd.fandom.com/wiki/";
    var summaryRow = 9;
  }
  else if (channel == "vavr")
  {
    var channelSheet = spreadsheet.getSheetByName("VvvvvaVvvvvvr");
    var channelId = "UCCPGE1kAoonfPsbieW41ZZA";
    var wikiUrl = "https://vvvvvavvvvvr.fandom.com/wiki/";
    var summaryRow = 16;
  }
  else if (channel == "ff")
  {
    var channelSheet = spreadsheet.getSheetByName("Flustered Fernando");
    var channelId = "UC8Q9CaWvV5_x90Z9VZ5cxmg";
    var wikiUrl = "https://flustered-fernando.fandom.com/wiki/";
    var summaryRow = 23;
  }

  if (currentHour == 23)
    taskId = 2;
  else if (currentHour >= 21)
    taskId = 1;

  summaryRow += taskId;

  channelSheet.getDataRange().sort({column: 4, ascending: false});
  addNewVideos();
  channelSheet.getDataRange().sort({column: 4, ascending: false});

  var row = summarySheet.getRange(summaryRow, 5).getValue();

  if (channel == "siiva" || channel == "ttgd")
  {
    for (var i = 2; i < 21; i++)
      updateWikiStatus(i);
  }

  while (ready)
  {
    if (row >= channelSheet.getLastRow())
    {
      if (taskid == 0  && (channel == "siiva" || channel == "ttgd"))
        row = 22;
      else
        row = 2;
    }
    else row++;

    if (taskId == 0)
      updateWikiStatus(row);
    else if (taskId == 1)
      updateVideoStatus(row);
    else if (taskId == 2)
      updateDescTitleStatus(row);

    var currentTime = new Date();
    var currentTimeUtc = Utilities.formatDate(new Date(), "UTC", "MM/dd/yy HH:mm:ss");
    summarySheet.getRange(summaryRow, 5).setValue(row);
    summarySheet.getRange(summaryRow, 6).setValue(currentTimeUtc);

    // Check if the script timer has passed a specified time limit.
    if (currentTime.getTime() - startTime.getTime() > (10 * 60 * 500)) // 5 minutes
    {
      if (errorLog.length > 0)
      {
        var emailAddress = "a.k.zamboni@gmail.com";
        var subject = "List of Uploads Alert";
        var message = "There are " + errorLog.length + " new alerts.\n\n" + errorLog.join("\n\n").replace(/NEWLINE/g, "\n");

        MailApp.sendEmail(emailAddress, subject, message);
        Logger.log("Email successfully sent.\n" + message);
      }
      ready = false;
    }
  }

  // Add new rips to list.
  function addNewVideos()
  {
    var mostRecent = channelSheet.getRange("D2").getValue();
    var row = channelSheet.getLastRow() + 1;
    var newRipCount = 0;
    var results = YouTube.Channels.list('contentDetails', {id: channelId});

    Logger.log("Most recent upload date: " + mostRecent);

    for (var i in results.items)
    {
      var item = results.items[i];
      var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
      var nextPage = true;
      var nextPageToken = "";

      while (nextPage)
      {
        var playlistResponse = YouTube.PlaylistItems.list('snippet,contentDetails', {playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken});
        var pageRipCount = 0;

        for (var j = 0; j < playlistResponse.items.length; j++)
        {
          var playlistItem = playlistResponse.items[j];
          var publishDate = playlistItem.snippet.publishedAt.replace(/.000Z/g, "Z");

          if (publishDate > mostRecent)
          {
            var originalTitle = playlistItem.snippet.title;
            var encodedTitle = format(originalTitle);
            var url = wikiUrl + encodedTitle;
            var id = playlistItem.snippet.resourceId.videoId;
            var description = playlistItem.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");

            channelSheet.insertRowAfter(channelSheet.getLastRow());
            channelSheet.getRange(row, 1).setValue(originalTitle);
            channelSheet.getRange(row, 2).setValue("Unknown");
            channelSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
            channelSheet.getRange(row, 4).setValue(publishDate);
            channelSheet.getRange(row, 6).setValue(description);
            channelSheet.getRange(row, 7).setValue("Public");

            var results = YouTube.Videos.list('contentDetails',{id: id, maxResults: 1, type: 'video'});

            results.items.forEach(function(item)
                                  {
                                    var length = item.contentDetails.duration.toString();
                                    channelSheet.getRange(row, 5).setValue(length);
                                  });

            Logger.log("Row " + row + ": " + originalTitle + " - " + publishDate);
            row++;
            newRipCount++;
            pageRipCount++;
          }
        }

        if (pageRipCount != 0)
        {
          nextPage = true;
          nextPageToken = playlistResponse.nextPageToken;
        }
        else nextPage = false;
      }
    }

    for (var i = 0; i < 3; i++)
    {
      var lastUpdatedRow = summaryRow - taskId + i;
      var lastUpdatedRowVal = summarySheet.getRange(lastUpdatedRow, 5).getValue();
      summarySheet.getRange(lastUpdatedRow, 5).setValue(lastUpdatedRowVal + newRipCount);
    }
    Logger.log("New rips: " + newRipCount);
  }

  function updateWikiStatus(row)
  {
    var originalTitle = channelSheet.getRange(row, 1).getValue();
    var encodedTitle = format(originalTitle);
    var url = wikiUrl + encodedTitle;
    var oldStatus = channelSheet.getRange(row, 2).getValue();
    var id = channelSheet.getRange(row, 3).getValue();

    try
    {
      var response = UrlFetchApp.fetch(url).getResponseCode();

      channelSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') + '")');
      channelSheet.getRange(row, 2).setValue("No");
    }
    catch (e)
    {
      e = e.toString().replace(/\n\n/g, "\n");

      if (e.indexOf("404") != -1)
      {
        channelSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') +'")');
        channelSheet.getRange(row, 2).setValue("Yes");
      }
      else if (e.indexOf("Address unavailable") == -1 && e.indexOf("501") == -1)
      {
        Logger.log(e + "\n" + originalTitle + "\n" + url);
        errorLog.push(e + "\n[" + originalTitle + "]\n[" + url + "]");
      }
    }

    var newStatus = channelSheet.getRange(row, 2).getValue();

    if (channel == "siiva")
    {
      if (oldStatus == "Yes" && newStatus == "No") // The rip no longer needs an article
      {
        Logger.log("Remove from playlist: " + originalTitle);
        try
        {
          var videoResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: id});
          var deletionId = videoResponse.items[0].id;
          YouTube.PlaylistItems.remove(deletionId);
        }
        catch (e)
        {
          e = e.toString().replace(/\n\n/g, "\n");
          Logger.log(e + "\n" + originalTitle + "\n" + url);
          errorLog.push(e + "\n[" + originalTitle + "]\n[" + url + "]");
        }
      }
      else if (oldStatus != newStatus && newStatus == "Yes") // The rip needs an article
      {
        Logger.log("Add to playlist: " + originalTitle);
        YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: id}}}, "snippet");
      }
    }
    Logger.log("Row " + row + ": " + originalTitle + " (" + oldStatus + ", " + newStatus + ")");
  }

  function updateVideoStatus(row)
  {
    var title = channelSheet.getRange(row, 1).getValue();
    var vidId = channelSheet.getRange(row, 3).getValue();
    var currentStatus = channelSheet.getRange(row, 7).getValue();
    var url = "https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=" + vidId + "&format=json";

    try
    {
      var response = UrlFetchApp.fetch(url).getResponseCode();
      channelSheet.getRange(row, 7).setValue("Public");
    }
    catch (e)
    {
      e = e.toString().replace(/\n\n/g, "\n");
      if (e.indexOf("404") != -1)
      {
        if (currentStatus != "Deleted")
          errorLog.push(title + " has been deleted.");

        channelSheet.getRange(row, 7).setValue("Deleted");
      }
      else if (e.indexOf("401") != -1)
      {
        if (currentStatus != "Private")
          errorLog.push(title + " has been privated.");

        channelSheet.getRange(row, 7).setValue("Private");
      }
      else
      {
        if (channelSheet.getRange(row, 7).getValue() == "")
          channelSheet.getRange(row, 7).setValue("Unknown");

        if (e.indexOf("Address unavailable") == -1)
        {
          Logger.log(e + "\n" + originalTitle + "\n" + url);
          errorLog.push(e + "\n[" + originalTitle + "]\n[" + url + "]");
        }
      }
    }
    Logger.log("Row " + row + ": " + title + " (" + response + ")");
  }

  function updateDescTitleStatus(row)
  {
    var sheetTitle = channelSheet.getRange(row, 1).getValue();
    var videoStatus = channelSheet.getRange(row, 7).getValue();

    if (videoStatus == "Public" || videoStatus == "Normal")
    {
      var sheetDesc = channelSheet.getRange(row, 6).getValue();
      var vidTitle = "";
      var vidDesc = "";
      var vidId = channelSheet.getRange(row, 3).getValue();
      var change = false;

      try
      {
        var results = YouTube.Videos.list('snippet', {id: vidId, maxResults: 1, type: 'video'});
        results.items.forEach(function(item)
                              {
                                vidTitle = item.snippet.title;
                                vidDesc = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                              });
      }
      catch(e)
      {
        e = e.toString().replace(/\n\n/g, "\n");
        Logger.log(e + "\n" + vidId);
        errorLog.push(e + "\n[" + vidId + "]");
      }

      if (sheetTitle != vidTitle)
      {
        change = true;
        var url = "[" + wikiUrl + format(sheetTitle) + "]\n[" + wikiUrl + format(vidTitle) + "]";
        var urlRow = '=HYPERLINK("' + url + '", "' + vidTitle.replace(/"/g, '""') +'")';
        channelSheet.getRange(row, 1).setFormula(urlRow);
        errorLog.push(url + "\nOLD TITLE:\n" + sheetTitle + "\nNEW TITLE:\n" + vidTitle);
      }

      if (sheetDesc != vidDesc)
      {
        change = true;
        var url = "[" + wikiUrl + format(vidTitle) + "]";
        channelSheet.getRange(row, 6).setValue(vidDesc);
        errorLog.push(url + "\nOLD DESCRIPTION:\n" + sheetDesc + "\nNEW DESCRIPTION:\n" + vidDesc);
      }
    }
    Logger.log("Row " + row + ": " + sheetTitle + " (" + change + ")");
  }
}

function format(str)
{
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/#/g, '');
  str = str.replace(/\​\|\​_/g, 'L');
  str = str.replace(/\|/g, '∣');
  str = str.replace(/Nigga/g, 'N----');
  return encodeURIComponent(str);
}

// Checks to see if any uploaded rips are missing from the spreadsheet.
function checkForMissingRips()
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var channelId = "UC9ecwl3FTG66jIKA9JRDtmg";
  var range = "C2:C" + channelSheet.getLastRow();
  var ripIds = channelSheet.getRange(range).getValues();
  var vidIds = [];
  var missingRips = [];
  var results = YouTube.Channels.list('contentDetails', {id: channelId});

  for (var i in results.items)
  {
    var item = results.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
    var nextPageToken = "";
    var row = 1;

    //for (var j = 0; j < 200; j++)
    while (nextPageToken != null)
    {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken});

      for (var k = 0; k < playlistResponse.items.length; k++)
      {
        vidIds.push(playlistResponse.items[k].snippet.resourceId.videoId);
        nextPageToken = playlistResponse.nextPageToken;
      }
    }
  }

  Logger.log("Video IDs: " + vidIds.length);
  Logger.log("Sheet IDs: " + ripIds.length);

  for (var i in vidIds)
  {
    var missing = true;

    for (var j in ripIds)
    {
      if (vidIds[i] == ripIds[j][0])
      {
        missing = false;
        break;
      }
    }

    if (missing == true)
      missingRips.push(vidIds[i]);
  }

  Logger.log("Missing: " + missingRips);

  for (var i in missingRips)
  {
    getVidDetails(missingRips[i])
  }
}

function getVidDetails(vidId)
{
  //vidId = "VB3s9_k_fUI"; // unlisted
  var channelId = "UC9ecwl3FTG66jIKA9JRDtmg";
  var results = YouTube.Channels.list('contentDetails', {id: channelId});

  for (var i in results.items)
  {
    var uploadsPlaylistId = results.items[i].contentDetails.relatedPlaylists.uploads;
    var playlistResponse = YouTube.PlaylistItems.list('snippet,contentDetails', {playlistId: uploadsPlaylistId, videoId: vidId});
    Logger.log(vidId + "\t" + playlistResponse.items.length);

    for (var j = 0; j < playlistResponse.items.length; j++)
    {
      var publishDate = playlistResponse.items[j].snippet.publishedAt.replace(/.000Z/g, "Z");
      var results = YouTube.Videos.list('snippet,contentDetails', {id: vidId, maxResults: 1, type: 'video'});

      results.items.forEach(function(item)
                            {
                              var originalTitle = item.snippet.title;
                              var encodedTitle = format(originalTitle);
                              var url = wikiUrl + encodedTitle;
                              var urlRow = '=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') +'")';
                              var nameRow = '=HYPERLINK("https://www.youtube.com/watch?v=' + vidId + '", "' + vidId + '")';
                              var length = item.contentDetails.duration.toString();
                              var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                              Logger.log("\n" + urlRow + "\n" + nameRow + "\n" + publishDate + "\n" + length + "\n" + description);
                            });
    }
  }
}

function comparePlaylist()
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
  var plVideoNames = [];
  var plVideos = [];
  var sheetVideos = channelSheet.getRange(2, 3, channelSheet.getLastRow() - 1).getValues();
  var sheetVideoVals = channelSheet.getRange(2, 2, channelSheet.getLastRow() - 1).getValues();
  var undocumentedRips = [];
  var nextPageToken = "";

  while (nextPageToken != null)
  {
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50, pageToken: nextPageToken});

    for (var i = 0; i < playlistResponse.items.length; i++)
    {
      plVideoNames.push(playlistResponse.items[i].snippet.title);
      plVideos.push(playlistResponse.items[i].snippet.resourceId.videoId);
      nextPageToken = playlistResponse.nextPageToken;
    }
  }

  for (var i in sheetVideos)
  {
    if (sheetVideoVals[i][0] == "Yes")
      undocumentedRips.push(sheetVideos[i][0]);
  }

  Logger.log(undocumentedRips.length);
  Logger.log(plVideos.length);
  Logger.log(undocumentedRips);
  Logger.log(plVideos);

  // Currently not working
  for (var i in undocumentedRips)
  {
    for (var k in plVideos)
    {
      if (undocumentedRips[i] == plVideos[k])
        break;
    }
  }
}

function createTrigger()
{
  ScriptApp.newTrigger("updateList")
  .timeBased()
  .everyMinutes(30)
  .create();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// THE FOLLOWING CODE IS OUTDATED. UPDATE TO CURRENT STANDARDS BEFORE USING //////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Builds a spreadsheet with basic information for every SiIvaGunner video.
function buildList()
{
  var startTime = new Date();
  var mostRecent = channelSheet.getRange("D2").getValue();
  var results = YouTube.Channels.list('contentDetails', {id: channelId});
  var scheduled = false;

  for (var i in results.items)
  {
    var item = results.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
    var nextPageToken = "";
    var row = 1;
    var lastRow = channelSheet.getLastRow();

    while (nextPageToken != null)
    {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken});

      for (var j = 0; j < playlistResponse.items.length; j++)
      {
        row++;
        if (row > lastRow)// || row == 2)
        {
          var playlistItem = playlistResponse.items[j];
          var originalTitle = playlistItem.snippet.title;
          var encodedTitle = format(originalTitle);
          var id = playlistItem.snippet.resourceId.videoId;
          var publishDate = playlistItem.snippet.publishedAt;
          var url = wikiUrl + encodedTitle;
          var description = playlistItem.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");

          channelSheet.insertRowAfter(channelSheet.getLastRow());
          channelSheet.getRange(row, 1).setValue(originalTitle);
          channelSheet.getRange(row, 2).setValue("Unknown");
          channelSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
          channelSheet.getRange(row, 4).setValue(publishDate);
          channelSheet.getRange(row, 6).setValue(description);
          channelSheet.getRange(row, 7).setValue("Public");

          Logger.log("Row " + row + ": " + originalTitle);
        }
        nextPageToken = playlistResponse.nextPageToken;

        // Check if the script timer has passed a specified time limit.
        var currentTime = new Date();

        if (currentTime.getTime() - startTime.getTime() > (10 * 60 * 2800) && !scheduled) // 28 minutes
        {
          var allTriggers = ScriptApp.getProjectTriggers();

          for (var i = 0; i < allTriggers.length; i++)
            ScriptApp.deleteTrigger(allTriggers[i]);

          ScriptApp.newTrigger("buildList")
          .timeBased()
          .after(10 * 60 * 500) // 5 minutes
          .create();

          scheduled = true;
        }
        if (scheduled) break;
      }
      if (scheduled) break;
    }
  }
  channelSheet.getDataRange().sort({column: 4, ascending: false});
}
