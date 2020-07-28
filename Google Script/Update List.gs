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

  Logger.log("Channel: " + channel);

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

  Logger.log("Task id: " + taskId);
  summaryRow += taskId;
  addNewVideos();

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
      if (taskId == 0  && (channel == "siiva" || channel == "ttgd"))
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
    channelSheet.getDataRange().sort({column: 4, ascending: false});
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
    channelSheet.getDataRange().sort({column: 4, ascending: false});

    // Archive all new videos
    /*
    if (newRipCount < 3)
    {
      for (var i = 2; i < newRipCount + 2; i++)
      {
        Logger.log("Start archiving row " + i);
        var archiveUrl = "https://web.archive.org/save/https://www.youtube.com/watch?v=" + channelSheet.getRange(i, 3).getValue();
        var ready = true;

        while (ready)
        {
          try
          {
            var response = UrlFetchApp.fetch(archiveUrl);
            ready = false;
          }
          catch(e)
          {
            Logger.log(e);
          }
        }
        Logger.log("Finished archiving row " + i);
      }
    }
    //*/
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
      else if (e.indexOf("Address unavailable") == -1 && e.indexOf("Unexpected error") == -1)
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
        var wikiHyperlink = '=HYPERLINK("' + url + '", "' + vidTitle.replace(/"/g, '""') +'")';
        channelSheet.getRange(row, 1).setFormula(wikiHyperlink);
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

function updateListTrigger()
{
  ScriptApp.newTrigger("updateList")
  .timeBased()
  .everyMinutes(30)
  .create();
}

// Checks to see if any public uploaded rips are missing from the spreadsheet.
function checkList()
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var channelId = "UC9ecwl3FTG66jIKA9JRDtmg";
  var channelVideoIds = [];
  var missingVideoIds = [];
  var sheetVideoIds = channelSheet.getRange(2, 3, channelSheet.getLastRow() - 1).getValues();
  var results = YouTube.Channels.list('contentDetails', {id: channelId});

  for (var i in results.items)
  {
    var item = results.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
    var nextPageToken = "";

    while (nextPageToken != null)
    {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken});

      for (var k = 0; k < playlistResponse.items.length; k++)
      {
        channelVideoIds.push(playlistResponse.items[k].snippet.resourceId.videoId);
        nextPageToken = playlistResponse.nextPageToken;
      }
    }
  }

  Logger.log("Sheet IDs: " + sheetVideoIds.length);
  Logger.log("Video IDs: " + channelVideoIds.length);

  var lastRow = channelSheet.getLastRow();

  for (var i in channelVideoIds)
  {
    for (var k in sheetVideoIds)
    {
      if (channelVideoIds[i] == sheetVideoIds[k][0])
        break;
      else if (k == sheetVideoIds.length - 1)
      {
        Logger.log("Missing from sheet: " + channelVideoIds[i]);

        var results = YouTube.Videos.list('snippet,contentDetails',{id: channelVideoIds[i], maxResults: 1, type: 'video'});

        results.items.forEach(function(item)
                              {
                                var publishDate = item.snippet.publishedAt.replace(/.000Z/g, "Z");
                                var length = item.contentDetails.duration.toString();
                                var originalTitle = item.snippet.title;
                                var encodedTitle = format(originalTitle);
                                var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
                                var wikiHyperlink = '=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') +'")';
                                var videoHyperlink = '=HYPERLINK("https://www.youtube.com/watch?v=' + channelVideoIds[i] + '", "' + channelVideoIds[i] + '")';
                                var length = item.contentDetails.duration.toString();
                                var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                                Logger.log(publishDate + "\n" + wikiHyperlink + "\n" + videoHyperlink + "\n" + publishDate + "\n" + length + "\n" + description);

                                channelSheet.insertRowAfter(lastRow);
                                lastRow++;

                                channelSheet.getRange(lastRow, 1).setValue(wikiHyperlink);
                                channelSheet.getRange(lastRow, 2).setValue("Unknown");
                                channelSheet.getRange(lastRow, 3).setFormula(videoHyperlink);
                                channelSheet.getRange(lastRow, 4).setValue(publishDate);
                                channelSheet.getRange(lastRow, 5).setValue(length);
                                channelSheet.getRange(lastRow, 6).setValue(description);
                                channelSheet.getRange(lastRow, 7).setValue("Public");
                              });
      }
    }
  }
  channelSheet.getDataRange().sort({column: 4, ascending: false});
}

// Checks to see if any deleted, privated, or unlisted rips are missing from the spreadsheet.
function checkWiki()
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var lastRow = channelSheet.getLastRow();
  var sheetVideoTitles = channelSheet.getRange(2, 1, channelSheet.getLastRow() - 1).getValues();
  var removedVideoTitles = [""];
  var categories = ["9/11 2016", "GiIvaSunner non-reuploaded", "Removed Green de la Bean rips", "Removed rips", "Unlisted rips", "Unlisted videos"];

  for (var i in categories)
  {
    var e = "";
    var url = "https://siivagunner.fandom.com/api.php?";
    var params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:" + encodeURIComponent(categories[i]),
      cmtpye: "title",
      cmlimit: "500",
      format: "json"
    };

    Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});

    while (e.indexOf("404") == -1)
    {
      try
      {
        var response = UrlFetchApp.fetch(url);
        var data = JSON.parse(response.getContentText());
        var categoryMembers = data.query.categorymembers;

        Logger.log("Working on " + categories[i] + " (" + categoryMembers.length + ")");

        for (var k in categoryMembers)
        {
          for (var j in removedVideoTitles)
          {
            if (categoryMembers[k].title == removedVideoTitles[j])
              break;
            else if (j == removedVideoTitles.length - 1)
            {
              if (categoryMembers[k].title.indexOf("Category:") == -1)
                removedVideoTitles.push(categoryMembers[k].title);
            }
          }
        }

        break;
      }
      catch(e)
      {
        Logger.log(e);
      }
    }
  }

  removedVideoTitles.shift();
  Logger.log("There are " + removedVideoTitles.length + " removed rips.");

  for (var i in removedVideoTitles)
  {
    for (var k in sheetVideoTitles)
    {
      if (removedVideoTitles[i] == sheetVideoTitles[k])
      {
        Logger.log("Not missing: " + removedVideoTitles[i]);
        break;
      }
      else if (k == sheetVideoTitles.length - 1)
        Logger.log("Yes missing: " + removedVideoTitles[i]);
    }
  }
}

function checkPlaylist()
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
  var plistVideoIds = [];
  var sheetUndocIds = [];
  var sheetVideoIds = channelSheet.getRange(2, 3, channelSheet.getLastRow() - 1).getValues();
  var sheetVideoVals = channelSheet.getRange(2, 2, channelSheet.getLastRow() - 1).getValues();
  var nextPageToken = "";

  while (nextPageToken != null)
  {
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50, pageToken: nextPageToken});

    for (var i = 0; i < playlistResponse.items.length; i++)
    {
      plistVideoIds.push(playlistResponse.items[i].snippet.resourceId.videoId);
      nextPageToken = playlistResponse.nextPageToken;
    }
  }

  for (var i in sheetVideoIds)
  {
    if (sheetVideoVals[i][0] == "Yes")
      sheetUndocIds.push(sheetVideoIds[i][0]);
  }

  Logger.log("Sheet length: " + sheetUndocIds.length);
  Logger.log("Sheet length: " + sheetUndocIds);
  Logger.log("Playlist IDs: " + plistVideoIds.length);
  Logger.log("Playlist IDs: " + plistVideoIds);

  for (var i in plistVideoIds)
  {
    for (var k in sheetUndocIds)
    {
      if (plistVideoIds[i] == sheetUndocIds[k])
        break;
      else if (k == sheetUndocIds.length - 1)
        Logger.log("Missing from sheet: " + plistVideoIds[i]);
    }
  }

  for (var i in sheetUndocIds)
  {
    for (var k in plistVideoIds)
    {
      if (sheetUndocIds[i] == plistVideoIds[k])
        break;
      else if (k == plistVideoIds.length - 1)
      {
        Logger.log("Missing from playlist: " + sheetUndocIds[i]);
      }
    }
  }
}

function format(str)
{
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/\{/g, '(');
  str = str.replace(/\}/g, ')');
  str = str.replace(/#/g, '');
  str = str.replace(/\​\|\​_/g, 'L');
  str = str.replace(/\|/g, '∣');
  str = str.replace(/Nigga/g, 'N----');
  return encodeURIComponent(str);
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
