// Update rip values and add missing rips.
// This is the main function that manages most of the updating and managing of the spreadsheet.
function checkSheet()
{
  var startTime = new Date();
  var startDate = startTime.getDate();
  var startHour = startTime.getHours();
  var startMinute = startTime.getMinutes();
  var summarySheet = spreadsheet.getSheetByName("Summary");
  var errorLog = [];
  var changelog = [];
  var channel = "SiIvaGunner";
  var taskId = 0;

  if (startDate == 1 && startHour >= 20 && startMinute >= 30)
    channel = "Flustered Fernando";
  else if (startDate % 14 == 0 && startMinute >= 30)
    channel = "VvvvvaVvvvvvr";
  else if ((startDate % 3 == 0 || startHour == 0) && startMinute >= 30)
    channel = "TimmyTurnersGrandDad";

  switch(channel)
  {
    case "SiIvaGunner":
      var channelId = "UC9ecwl3FTG66jIKA9JRDtmg";
      var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
      var wikiUrl = "https://siivagunner.fandom.com/wiki/";
      var summaryRow = 2;
      break;
    case "TimmyTurnersGrandDad":
      var channelId = "UCIXM2qZRG9o4AFmEsKZUIvQ";
      var wikiUrl = "https://ttgd.fandom.com/wiki/";
      var summaryRow = 9;
      break;
    case "VvvvvaVvvvvvr":
      var channelId = "UCCPGE1kAoonfPsbieW41ZZA";
      var wikiUrl = "https://vvvvvavvvvvr.fandom.com/wiki/";
      var summaryRow = 16;
      break;
    case "Flustered Fernando":
      var channelId = "UC8Q9CaWvV5_x90Z9VZ5cxmg";
      var wikiUrl = "https://flustered-fernando.fandom.com/wiki/";
      var summaryRow = 23;
  }

  var channelSheet = spreadsheet.getSheetByName(channel);

  if (startHour > 18)
    taskId = 2;
  else if (startHour > 4)
    taskId = 1;

  Logger.log("Channel: " + channel);
  Logger.log("Hour: " + startHour);
  Logger.log("Task id: " + taskId);

  summaryRow += taskId;

  addNewVideos();
  checkNewArticles();

  var row = summarySheet.getRange(summaryRow, lastUpdatedRowCol).getValue();

  do
  {
    if (row >= channelSheet.getLastRow())
      row = 2;
    else
      row++;

    if (taskId == 0)
      checkWikiStatus(row);
    else if (taskId == 1)
      checkVideoStatus(row);
    else if (taskId == 2)
      checkDescTitleStatus(row);

    var currentTime = new Date();
    summarySheet.getRange(summaryRow, lastUpdatedRowCol).setValue(row);
    summarySheet.getRange(summaryRow, lastUpdatedTimeCol).setValue(currentTime);
  }
  while (currentTime.getTime() - startTime.getTime() < 80000) // Run until the time passes 80 seconds.

  if (errorLog.length > 0)
  {
    // Send an email notifying of any changes or errors.
    var emailAddress = "a.k.zamboni@gmail.com";
    var subject = "List of Uploads Alert";
    var message = "There are " + errorLog.length + " new alerts.\n\n" + errorLog.join("\n\n").replace(/NEWLINE/g, "\n");

    MailApp.sendEmail(emailAddress, subject, message);
    Logger.log("Email successfully sent.\n" + message);

    // Update the changelog spreadsheet with any new changes.
    Logger.log(changelog);
    var changelogSpreadsheet = SpreadsheetApp.openById("1EKQq1K8Bd7hDlFMg1Y5G_a2tWk_FH39bgniUUBGlFKM");

    for (var i in changelog)
    {
      var changelogSheet = changelogSpreadsheet.getSheetByName(changelog[i][0]);

      changelogSheet.insertRowBefore(2);
      changelogSheet.getRange(2, changelogSheet.getLastColumn() - 1).setValue(channel);
      changelogSheet.getRange(2, changelogSheet.getLastColumn()).setValue(currentTime);

      for (var k = 1; k < changelog[i].length; k++)
        changelogSheet.getRange(2, parseInt(k)).setValue(changelog[i][k]);
    }
  }

  // Add new rips to list.
  function addNewVideos()
  {
    channelSheet.getDataRange().sort({column: videoUploadDateCol, ascending: false});

    var recentIds = channelSheet.getRange(2, idCol, 20).getValues();
    var lastRow = channelSheet.getLastRow();
    var newVideoCount = 0;
    var channelResponse = YouTube.Channels.list('contentDetails', {id: channelId});

    for (var i in channelResponse.items)
    {
      var item = channelResponse.items[i];
      var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
      var nextPageToken = "";

      while (nextPageToken != null)
      {
        var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 10, pageToken: nextPageToken});
        var pageRipCount = 0;

        for (var j = 0; j < playlistResponse.items.length; j++)
        {
          var videoId = playlistResponse.items[j].snippet.resourceId.videoId;
          var index = recentIds.findIndex(ids => {return ids[0] == videoId});

          if (index == -1)
          {
            var videoResponse = YouTube.Videos.list('snippet,contentDetails,statistics',{id: videoId, maxResults: 1, type: 'video'});

            videoResponse.items.forEach(function(item)
                                        {
                                          var channelId = item.snippet.channelId;
                                          var title = item.snippet.title;
                                          var uploadDate = formatDate(item.snippet.publishedAt);
                                          var length = item.contentDetails.duration.toString();
                                          var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                                          var viewCount = item.statistics.viewCount;
                                          var likeCount = item.statistics.likeCount;
                                          var dislikeCount = item.statistics.dislikeCount;
                                          var commentCount = item.statistics.commentCount;

                                          channelSheet.insertRowAfter(lastRow);
                                          lastRow++;
                                          newVideoCount++;
                                          pageRipCount++;

                                          channelSheet.getRange(lastRow, idCol).setFormula(formatYouTubeHyperlink(videoId));
                                          channelSheet.getRange(lastRow, titleCol).setFormula(formatWikiHyperlink(title, wikiUrl));
                                          channelSheet.getRange(lastRow, wikiStatusCol).setValue("Undocumented");
                                          channelSheet.getRange(lastRow, videoStatusCol).setValue("Public");
                                          channelSheet.getRange(lastRow, videoUploadDateCol).setValue(uploadDate);
                                          channelSheet.getRange(lastRow, videoLengthCol).setValue(length);
                                          channelSheet.getRange(lastRow, videoDescriptionCol).setValue(description);
                                          channelSheet.getRange(lastRow, videoViewsCol).setValue(viewCount);
                                          channelSheet.getRange(lastRow, videoLikesCol).setValue(likeCount);
                                          channelSheet.getRange(lastRow, videoDislikesCol).setValue(dislikeCount);
                                          channelSheet.getRange(lastRow, videoCommentsCol).setValue(commentCount);

                                          Logger.log("Row " + lastRow + ": " + title + " - " + uploadDate);

                                          if (playlistId)
                                          {
                                            Logger.log("Add to playlist: " + title);
                                            YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: videoId}}}, "snippet");
                                          }
                                        });
          }
        }

        // Fix this
        if (pageRipCount == 0)
          nextPageToken = null;
        else
          nextPageToken = playlistResponse.nextPageToken;

        nextPageToken = null;
      }
    }

    for (var i = 0; i < 3; i++)
    {
      var lastUpdatedRow = summaryRow - taskId + i;
      var lastUpdatedRowVal = summarySheet.getRange(lastUpdatedRow, lastUpdatedRowCol).getValue();
      summarySheet.getRange(lastUpdatedRow, lastUpdatedRowCol).setValue(lastUpdatedRowVal + newVideoCount);
    }

    Logger.log("New rips: " + newVideoCount);
    channelSheet.getDataRange().sort({column: videoUploadDateCol, ascending: false});
  }

  function checkNewArticles()
  {
    var sheetTitles = channelSheet.getRange(2, titleCol, channelSheet.getLastRow() - 1).getValues();
    var url = wikiUrl + "Special:NewPages?limit=5";
    var wikiTitles = [];
    var errorLog = [];

    do
    {
      try
      {
        var responseText = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText();
      }
      catch (e)
      {
        var responseText = null;
      }
    }
    while (responseText == null)

    while (responseText.indexOf("mw-newpages-pagename") != -1)
    {
      var title = responseText.split("mw-newpages-pagename\">")[1].split("<")[0];
      wikiTitles.push(title);
      responseText = responseText.replace("mw-newpages-pagename", "");
    }

    for (var i in wikiTitles)
    {
      var index = sheetTitles.findIndex(titles => {return formatWikiLink(titles[0]) == formatWikiLink(wikiTitles[i])});

      if (index != -1)
      {
        var row = index + 2;
        var originalStatus = channelSheet.getRange(row, wikiStatusCol).getValue();
        var videoId = channelSheet.getRange(row, idCol).getValue();

        if (originalStatus != "Documented")
          channelSheet.getRange(row, wikiStatusCol).setValue("Documented");

        Logger.log("Row " + row + ": " + wikiTitles[i] + " (" + originalStatus + ", Documented)")

        if (channel == "SiIvaGunner" && originalStatus != "Documented")
        {
          Logger.log("Remove from playlist: " + wikiTitles[i]);
          var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: videoId});
          var deletionId = playlistResponse.items[0].id;
          YouTube.PlaylistItems.remove(deletionId);
        }
      }
      else
        Logger.log("Missing from sheet: " + wikiTitles[i]);
    }
  }

  function checkWikiStatus(row)
  {
    var title = channelSheet.getRange(row, titleCol).getValue();
    var url = wikiUrl + formatWikiLink(title);
    var oldStatus = channelSheet.getRange(row, wikiStatusCol).getValue();
    var videoId = channelSheet.getRange(row, idCol).getValue();

    do
    {
      try
      {
        var responseCode = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getResponseCode();
      }
      catch (e)
      {
        var responseCode = null;
      }
    }
    while (responseCode == null)

    if (responseCode == 200 && oldStatus != "Documented")
      channelSheet.getRange(row, wikiStatusCol).setValue("Documented");
    else if (responseCode == 404 && oldStatus != "Undocumented")
      channelSheet.getRange(row, wikiStatusCol).setValue("Undocumented");
    else if (responseCode != 200 && responseCode != 404)
      errorLog.push("Response code " + responseCode + "\n[" + title + "]\n[" + url + "]");

    Logger.log("Row " + row + ": " + title + " (" + responseCode + ")");

    if (channel == "SiIvaGunner")
    {
      var newStatus = channelSheet.getRange(row, wikiStatusCol).getValue();

      if (oldStatus == "Undocumented" && newStatus == "Documented") // The rip no longer needs an article
      {
        Logger.log("Remove from playlist: " + title);
        var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: videoId});
        var deletionId = playlistResponse.items[0].id;
        YouTube.PlaylistItems.remove(deletionId);
      }
      else if (oldStatus != newStatus && newStatus == "Undocumented") // The rip needs an article
      {
        Logger.log("Add to playlist: " + title);
        YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: videoId}}}, "snippet");
      }
    }
  }

  function checkVideoStatus(row)
  {
    var videoId = channelSheet.getRange(row, idCol).getValue();

    if (videoId == "Unknown")
      return;

    var title = channelSheet.getRange(row, titleCol).getValue();
    var currentStatus = channelSheet.getRange(row, videoStatusCol).getValue();
    var url = "https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=" + videoId + "&format=json";

    do
    {
      try
      {
        var responseCode = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getResponseCode();
      }
      catch (e)
      {
        var responseCode = null;
      }
    }
    while (responseCode == null)

    Logger.log("Row " + row + ": " + title + " (" + responseCode + ")");

    switch(responseCode)
    {
      case 200:
        if (currentStatus != "Public" && currentStatus != "Unlisted")
        {
          channelSheet.getRange(row, videoStatusCol).setValue("Public");
          errorLog.push(title + " has been made public.");
          changelog.push(["Statuses", formatYouTubeHyperlink(videoId), formatWikiHyperlink(title, wikiUrl), currentStatus, "Public"]);
        }
        break;
      case 401:
        if (currentStatus != "Private")
        {
          channelSheet.getRange(row, videoStatusCol).setValue("Private");
          errorLog.push(title + " has been privated.");
          changelog.push(["Statuses", formatYouTubeHyperlink(videoId), formatWikiHyperlink(title, wikiUrl), currentStatus, "Private"]);
        }
        break;
      case 404:
        if (currentStatus != "Deleted")
        {
          channelSheet.getRange(row, videoStatusCol).setValue("Deleted");
          errorLog.push(title + " has been deleted.");
          changelog.push(["Statuses", formatYouTubeHyperlink(videoId), formatWikiHyperlink(title, wikiUrl), currentStatus, "Deleted"]);
        }
        break;
      default:
        errorLog.push("Response code " + responseCode + "\n[" + title + "]\n[" + url + "]");
    }
  }

  function checkDescTitleStatus(row)
  {
    var sheetTitle = channelSheet.getRange(row, titleCol).getValue();
    var videoStatus = channelSheet.getRange(row, videoStatusCol).getValue();
    var change = false;

    if (videoStatus == "Public" || videoStatus == "Normal")
    {
      var sheetDescription = channelSheet.getRange(row, videoDescriptionCol).getValue();
      var videoId = channelSheet.getRange(row, idCol).getValue();
      var videoTitle = null;
      var videoDescription = null;

      try
      {
        var videoResponse = YouTube.Videos.list('snippet,statistics', {id: videoId, maxResults: 1, type: 'video'});

        videoResponse.items.forEach(function(item)
                                    {
                                      videoTitle = item.snippet.title;
                                      videoDescription = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");

                                      var viewCount = item.statistics.viewCount;
                                      var likeCount = item.statistics.likeCount;
                                      var dislikeCount = item.statistics.dislikeCount;
                                      var commentCount = item.statistics.commentCount;

                                      channelSheet.getRange(row, videoViewsCol).setValue(viewCount);
                                      channelSheet.getRange(row, videoLikesCol).setValue(likeCount);
                                      channelSheet.getRange(row, videoDislikesCol).setValue(dislikeCount);
                                      channelSheet.getRange(row, videoCommentsCol).setValue(commentCount);
                                    });
      }
      catch(e)
      {
        e = e.toString().replace(/\n\n/g, "\n");
        Logger.log(e + "\n" + videoId);
        errorLog.push(e + "\n[" + videoId + "]");
      }

      if (sheetTitle != videoTitle && videoTitle != null)
      {
        change = true;
        var url = "[" + wikiUrl + formatWikiLink(videoTitle) + "]";
        channelSheet.getRange(row, titleCol).setFormula(formatWikiHyperlink(videoTitle));
        errorLog.push(url + "\nOLD TITLE:\n" + sheetTitle + "\nNEW TITLE:\n" + videoTitle);
        changelog.push(["Titles", formatYouTubeHyperlink(videoId), formatWikiHyperlink(sheetTitle, wikiUrl), formatWikiHyperlink(videoTitle, wikiUrl)]);
      }

      if (sheetDescription != videoDescription && videoDescription != null)
      {
        change = true;
        var url = "[" + wikiUrl + formatWikiLink(videoTitle) + "]";
        channelSheet.getRange(row, videoDescriptionCol).setValue(videoDescription);
        errorLog.push(url + "\nOLD DESCRIPTION:\n" + sheetDescription + "\nNEW DESCRIPTION:\n" + videoDescription);
        changelog.push(["Descriptions", formatYouTubeHyperlink(videoId), formatWikiHyperlink(videoTitle, wikiUrl), sheetDescription.replace(/NEWLINE/g, "\n"), videoDescription.replace(/NEWLINE/g, "\n")]);
      }
    }
    Logger.log("Row " + row + ": " + sheetTitle + " (" + change + ")");
  }
}

function checkSheetTrigger()
{
  ScriptApp.newTrigger("checkSheet")
  .timeBased()
  .everyMinutes(10)
  .create();
}

// Checks to see if any public uploaded rips are missing from the spreadsheet.
function checkPublicVideos()
{
  var channels = [["SiIvaGunner", "UC9ecwl3FTG66jIKA9JRDtmg"],
                  ["TimmyTurnersGrandDad", "UCIXM2qZRG9o4AFmEsKZUIvQ"],
                  ["VvvvvaVvvvvvr", "UCCPGE1kAoonfPsbieW41ZZA"],
                  ["Flustered Fernando", "UC8Q9CaWvV5_x90Z9VZ5cxmg"],
                  ["SiIvaGunner2", "UCYGz7FZImRL8oI68pD7NoKg"],
                  ["SiLvaGunner", "UCraDChjPs-r9FoNsmJufZZQ"]];

  for (var i in channels)
  {
    var channelTitle = channels[i][0];
    var channelId = channels[i][1];

    Logger.log("Working on " + channelTitle);

    var channelSheet = spreadsheet.getSheetByName(channelTitle);
    var channelVideoIds = [];
    var missingVideoIds = [];
    var sheetVideoIds = channelSheet.getRange(2, idCol, channelSheet.getLastRow() - 1).getValues();
    var channelResponse = YouTube.Channels.list('contentDetails', {id: channelId});

    for (var i in channelResponse.items)
    {
      var item = channelResponse.items[i];
      var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
      var nextPageToken = "";

      while (nextPageToken != null)
      {
        var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken});

        for (var k = 0; k < playlistResponse.items.length; k++)
          channelVideoIds.push(playlistResponse.items[k].snippet.resourceId.videoId);

        nextPageToken = playlistResponse.nextPageToken;
      }
    }

    Logger.log("Sheet IDs: " + sheetVideoIds.length);
    Logger.log("Video IDs: " + channelVideoIds.length);

    var lastRow = channelSheet.getLastRow();

    for (var k in channelVideoIds)
    {
      var index = sheetVideoIds.findIndex(ids => {return ids[0] == channelVideoIds[k]});

      if (index == -1)
        missingVideoIds.push(channelVideoIds[k]);
    }

    for (var k in missingVideoIds)
      Logger.log("Missing from sheet: " + missingVideoIds[k]);

    // Optionally, add all missing videos to the corresponding sheet.
    // addVideosById(missingVideoIds, channelTitle);
  }
}

// Checks to see if any deleted, privated, or unlisted rips are missing from the spreadsheet.
function checkRemovedVideos()
{
  var siivaSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var siiva2Sheet = spreadsheet.getSheetByName("SiIvaGunner2");
  var giivaSheet = spreadsheet.getSheetByName("GiIvaSunner Reuploads");

  var siivaVideoTitles = siivaSheet.getRange(2, titleCol, siivaSheet.getLastRow() - 1).getValues();
  var siiva2VideoTitles = siiva2Sheet.getRange(2, titleCol, siiva2Sheet.getLastRow() - 1).getValues();
  var giivaVideoTitles = giivaSheet.getRange(2, titleCol, giivaSheet.getLastRow() - 1).getValues();

  Logger.log("There are " + siivaVideoTitles.length + " SiIvaGunner rips.");
  Logger.log("There are " + siiva2VideoTitles.length + " SiIvaGunner2 rips.");
  Logger.log("There are " + giivaVideoTitles.length + " GiIvaSunner rips.");

  var sheetVideoTitles = [];

  for (var i in siivaVideoTitles)
    sheetVideoTitles.push(siivaVideoTitles[i][0]);

  for (var i in siiva2VideoTitles)
    sheetVideoTitles.push(siiva2VideoTitles[i][0]);

  for (var i in giivaVideoTitles)
    sheetVideoTitles.push(giivaVideoTitles[i][0]);

  var removedVideoTitles = [""];
  var categories = ["GiIvaSunner non-reuploaded", "GiIvaSunner reuploads", "9/11 2016", "Removed Green de la Bean rips", "Removed rips", "Unlisted rips", "Unlisted videos"];

  for (var i in categories)
  {
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

    do
    {
      try
      {
        var responseText = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText();
      }
      catch (e)
      {
        var responseText = null;
      }
    }
    while (responseText == null)

    var data = JSON.parse(responseText);
    var categoryMembers = data.query.categorymembers;

    Logger.log("Working on " + categories[i] + " (" + categoryMembers.length + ")");

    for (var k in categoryMembers)
    {
      var categoryMember = categoryMembers[k].title.replace(/ \(GiIvaSunner\)/g, "");

      if (categoryMember.indexOf("Category:") != -1)
        break;

      var index = removedVideoTitles.findIndex(ids => {return ids == categoryMember});

      if (index == -1)
        removedVideoTitles.push(categoryMember);
    }
  }

  removedVideoTitles.shift();
  Logger.log("There are " + removedVideoTitles.length + " removed rips.");

  var missingTitles = [];
  var row = 1;

  for (var i in removedVideoTitles)
  {
    var index = sheetVideoTitles.findIndex(ids => {return formatWikiLink(ids) == formatWikiLink(removedVideoTitles[i])});

    if (index == -1)
      missingTitles.push(removedVideoTitles[i]);
  }

  Logger.log("There are " + missingTitles.length + " missing rips.");

  for (var i in missingTitles)
    Logger.log(missingTitles[i]);
}

// Checks to see what rips in the undocumented rips playlist should or shouldn't be there.
function checkPlaylistVideos()
{
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
  var playlistVideoIds = [];
  var sheetUndocumentedIds = [];
  var sheetVideoIds = channelSheet.getRange(2, idCol, channelSheet.getLastRow() - 1).getValues();
  var sheetWikiStatuses = channelSheet.getRange(2, wikiStatusCol, channelSheet.getLastRow() - 1).getValues();
  var sheetVideoStatuses = channelSheet.getRange(2, videoStatusCol, channelSheet.getLastRow() - 1).getValues();
  var nextPageToken = "";

  while (nextPageToken != null)
  {
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50, pageToken: nextPageToken});

    for (var i = 0; i < playlistResponse.items.length; i++)
      playlistVideoIds.push(playlistResponse.items[i].snippet.resourceId.videoId);

    nextPageToken = playlistResponse.nextPageToken;
  }

  for (var i in sheetVideoIds)
  {
    if (sheetWikiStatuses[i][0] == "Undocumented" && (sheetVideoStatuses[i][0] == "Public" || sheetVideoStatuses[i][0] == "Unlisted"))
      sheetUndocumentedIds.push(sheetVideoIds[i][0]);
    else if (sheetWikiStatuses[i][0] == "Undocumented")
      Logger.log("Deleted video: " + sheetVideoIds[i][0]);
  }

  Logger.log("Sheet videos: " + sheetUndocumentedIds.length);
  Logger.log("Playlist videos: " + playlistVideoIds.length);

  // Find videos that shouldn't be in the playlist.
  for (var i in playlistVideoIds)
  {
    var index = sheetUndocumentedIds.findIndex(ids => {return ids == playlistVideoIds[i]});

    if (index == -1)
    {
      Logger.log("Remove from playlist: " + playlistVideoIds[i]);
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: playlistVideoIds[i]});
      var deletionId = playlistResponse.items[0].id;
      YouTube.PlaylistItems.remove(deletionId);
    }
  }

  // Find videos that should be in the playlist.
  for (var i in sheetUndocumentedIds)
  {
    var index = playlistVideoIds.findIndex(ids => {return ids == sheetUndocumentedIds[i]});

    if (index == -1)
    {
      Logger.log("Add to playlist: " + sheetUndocumentedIds[i]);
      YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: sheetUndocumentedIds[i]}}}, "snippet");
    }
  }

  // Find duplicate IDs in the sheet.
  for (var i in sheetUndocumentedIds)
  {
    for (var k in sheetUndocumentedIds)
    {
      if (sheetUndocumentedIds[i] == sheetUndocumentedIds[k] && k != i)
        Logger.log("Duplicate in sheet: " + sheetUndocumentedIds[i]);
    }
  }

  // Find duplicate IDs in the playlist.
  for (var i in playlistVideoIds)
  {
    for (var k in playlistVideoIds)
    {
      if (playlistVideoIds[i] == playlistVideoIds[k] && k != i)
        Logger.log("Duplicate in playlist: " + playlistVideoIds[i]);
    }
  }
}

// Add new video information to sheet using the IDs provided.
function addVideosById(videoIds, channel)
{
  var logging = false; // Log the operations when true
  var building = true; // Add to sheet when true
  var channelSheet = spreadsheet.getSheetByName(channel);
  var lastRow = channelSheet.getLastRow();

  if (channel == "TimmyTurnersGrandDad")
    var wikiUrl = "https://ttgd.fandom.com/wiki/";
  else if (channel == "VvvvvaVvvvvvr")
    var wikiUrl = "https://vvvvvavvvvvr.fandom.com/wiki/";
  else if (channel == "Flustered Fernando")
    var wikiUrl = "https://flustered-fernando.fandom.com/wiki/";
  else
    var wikiUrl = "https://siivagunner.fandom.com/wiki/";

  for (var i in videoIds)
  {
    var videoResponse = YouTube.Videos.list('snippet,contentDetails,statistics',{id: videoIds[i], maxResults: 1, type: 'video'});

    videoResponse.items.forEach(function(item)
                                {
                                  var channelId = item.snippet.channelId;
                                  var videoHyperlink = formatYouTubeHyperlink(videoIds[i]);
                                  var wikiHyperlink = formatWikiHyperlink(item.snippet.title, wikiUrl);
                                  var uploadDate = formatDate(item.snippet.publishedAt);
                                  var length = item.contentDetails.duration.toString();
                                  var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                                  var viewCount = item.statistics.viewCount;
                                  var likeCount = item.statistics.likeCount;
                                  var dislikeCount = item.statistics.dislikeCount;
                                  var commentCount = item.statistics.commentCount;

                                  if (logging)
                                  {
                                    Logger.log(channelId);
                                    Logger.log(videoHyperlink);
                                    Logger.log(wikiHyperlink);
                                    Logger.log(uploadDate);
                                    Logger.log(length);
                                    Logger.log(description);
                                    Logger.log(viewCount);
                                    Logger.log(likeCount);
                                    Logger.log(dislikeCount);
                                    Logger.log(commentCount);
                                  }

                                  if (building)
                                  {
                                    channelSheet.insertRowAfter(lastRow);
                                    lastRow++;

                                    channelSheet.getRange(lastRow, idCol).setFormula(videoHyperlink);
                                    channelSheet.getRange(lastRow, titleCol).setFormula(wikiHyperlink);
                                    channelSheet.getRange(lastRow, wikiStatusCol).setValue("Undocumented");
                                    channelSheet.getRange(lastRow, videoStatusCol).setValue("Public");
                                    channelSheet.getRange(lastRow, videoUploadDateCol).setValue(uploadDate);
                                    channelSheet.getRange(lastRow, videoLengthCol).setValue(length);
                                    channelSheet.getRange(lastRow, videoDescriptionCol).setValue(description);
                                    channelSheet.getRange(lastRow, videoViewsCol).setValue(viewCount);
                                    channelSheet.getRange(lastRow, videoLikesCol).setValue(likeCount);
                                    channelSheet.getRange(lastRow, videoDislikesCol).setValue(dislikeCount);
                                    channelSheet.getRange(lastRow, videoCommentsCol).setValue(commentCount);
                                  }
                                });
  }
}
