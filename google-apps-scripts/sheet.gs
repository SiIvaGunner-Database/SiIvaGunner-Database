// Update rip values and add missing rips.
function checkSheet()
{
  var startTime = new Date();
  var currentDate = startTime.getDate();
  var currentHour = startTime.getHours();
  var currentMinute = startTime.getMinutes();
  var summarySheet = spreadsheet.getSheetByName("Summary");
  var errorLog = [];
  var changelog = [];
  var channel = "SiIvaGunner";
  var taskId = 0;
  var ready = true;

  if (currentDate == 1 && currentHour >= 20 && currentMinute >= 30)
    channel = "Flustered Fernando";
  else if (currentDate % 14 == 0 && currentMinute >= 30)
    channel = "VvvvvaVvvvvvr";
  else if ((currentDate % 3 == 0 || currentHour == 0) && currentMinute >= 30)
    channel = "TimmyTurnersGrandDad";

  Logger.log("Channel: " + channel);

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

  if (currentHour == 23)
    taskId = 2;
  else if (currentHour > 4)
    taskId = 1;

  Logger.log("Task id: " + taskId);
  summaryRow += taskId;
  addNewVideos();
  checkNewArticles();

  var row = summarySheet.getRange(summaryRow, lastUpdatedRowCol).getValue();

  while (ready)
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

    // Check if the script timer has passed the 80 second time limit.
    if (currentTime.getTime() - startTime.getTime() > 80000)
    {
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
      ready = false;
    }
  }

  // Add new rips to list.
  function addNewVideos()
  {
    channelSheet.getDataRange().sort({column: videoUploadDateCol, ascending: false});
    var recentIds = channelSheet.getRange(2, idCol, 20).getValues();
    var lastRow = channelSheet.getLastRow();
    var newVideoCount = 0;
    var results = YouTube.Channels.list('contentDetails', {id: channelId});

    for (var i in results.items)
    {
      var item = results.items[i];
      var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
      var nextPageToken = "";

      while (nextPageToken != null)
      {
        var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 10, pageToken: nextPageToken});
        var pageRipCount = 0;

        for (var j = 0; j < playlistResponse.items.length; j++)
        {
          var id = playlistResponse.items[j].snippet.resourceId.videoId;
          var index = recentIds.findIndex(ids => {return ids[0] == id});

          if (index == -1)
          {
            var results = YouTube.Videos.list('snippet,contentDetails,statistics',{id: id, maxResults: 1, type: 'video'});

            results.items.forEach(function(item)
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

                                    channelSheet.getRange(lastRow, idCol).setFormula(formatYouTubeHyperlink(id));
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
                                      YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: id}}}, "snippet");
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
    var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
    var wikiUrl = "https://siivagunner.fandom.com/wiki/";
    var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";

    var sheetTitles = channelSheet.getRange(2, titleCol, channelSheet.getLastRow() - 1).getValues();
    var url = wikiUrl + "Special:NewPages?limit=5";
    var wikiTitles = [];
    var errorLog = [];

    var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText();

    while (response.indexOf("mw-newpages-pagename") != -1)
    {
      var title = response.split("mw-newpages-pagename\">")[1].split("<")[0];
      wikiTitles.push(title);
      response = response.replace("mw-newpages-pagename", "");
    }

    for (var i in wikiTitles)
    {
      var index = sheetTitles.findIndex(titles => {return formatWikiLink(titles[0]) == formatWikiLink(wikiTitles[i])});

      if (index != -1)
      {
        var row = index + 2;
        var originalStatus = channelSheet.getRange(row, wikiStatusCol).getValue();
        var videoId = channelSheet.getRange(row, idCol).getValue();

        Logger.log("Row " + row + ": " + wikiTitles[i] + " (" + originalStatus + ", Documented)")

        if (originalStatus != "Documented")
        {
          Logger.log("Remove from playlist: " + wikiTitles[i]);

          var videoResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: videoId});
          var deletionId = videoResponse.items[0].id;
          YouTube.PlaylistItems.remove(deletionId);

          channelSheet.getRange(row, wikiStatusCol).setValue("Documented");
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
    var id = channelSheet.getRange(row, idCol).getValue();
    var responseCode = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getResponseCode();

    if (responseCode == 200 && oldStatus != "Documented")
      channelSheet.getRange(row, wikiStatusCol).setValue("Documented");
    else if (responseCode == 404 && oldStatus != "Undocumented")
      channelSheet.getRange(row, wikiStatusCol).setValue("Undocumented");
    else if (responseCode != 200 && responseCode != 404)
      errorLog.push("Response code " + responseCode + "\n[" + title + "]\n[" + url + "]");

    Logger.log("Row " + row + ": " + title + " (" + responseCode + ")");

    var newStatus = channelSheet.getRange(row, wikiStatusCol).getValue();

    if (oldStatus != newStatus && newStatus == "Undocumented") // The rip needs an article
      errorLog.push(title + " was changed from documented to undocumented.\n[" + url + "]");

    if (channel == "SiIvaGunner")
    {
      if (oldStatus == "Undocumented" && newStatus == "Documented") // The rip no longer needs an article
      {
        Logger.log("Remove from playlist: " + title);
        try
        {
          var videoResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: id});
          var deletionId = videoResponse.items[0].id;
          YouTube.PlaylistItems.remove(deletionId);
        }
        catch (e)
        {
          e = e.toString().replace(/\n\n/g, "\n");
          Logger.log(e + "\n" + title + "\n" + url);
          errorLog.push(e + "\n[" + title + "]\n[" + url + "]");
        }
      }
      else if (oldStatus != newStatus && newStatus == "Undocumented") // The rip needs an article
      {
        Logger.log("Add to playlist: " + title);
        YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: id}}}, "snippet");
      }
    }
  }

  function checkVideoStatus(row)
  {
    var vidId = channelSheet.getRange(row, idCol).getValue();

    if (vidId == "Unknown")
      return;

    var title = channelSheet.getRange(row, titleCol).getValue();
    var currentStatus = channelSheet.getRange(row, videoStatusCol).getValue();
    var url = "https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=" + vidId + "&format=json";
    var responseCode = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getResponseCode();

    Logger.log("Row " + row + ": " + title + " (" + responseCode + ")");

    switch(responseCode)
    {
      case 200:
        if (responseCode == 200 && currentStatus != "Public" && currentStatus != "Unlisted")
        {
          channelSheet.getRange(row, videoStatusCol).setValue("Public");
          errorLog.push(title + " has been made public.");
          changelog.push(["Statuses", formatYouTubeHyperlink(vidId), formatWikiHyperlink(title, wikiUrl), currentStatus, "Public"]);
        }
        break;
      case 401:
        if (currentStatus != "Private")
        {
          channelSheet.getRange(row, videoStatusCol).setValue("Private");
          errorLog.push(title + " has been privated.");
          changelog.push(["Statuses", formatYouTubeHyperlink(vidId), formatWikiHyperlink(title, wikiUrl), currentStatus, "Private"]);
        }
        break;
      case 404:
        if (currentStatus != "Deleted")
        {
          channelSheet.getRange(row, videoStatusCol).setValue("Deleted");
          errorLog.push(title + " has been deleted.");
          changelog.push(["Statuses", formatYouTubeHyperlink(vidId), formatWikiHyperlink(title, wikiUrl), currentStatus, "Deleted"]);
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

    if (videoStatus == "Public" || videoStatus == "Normal")
    {
      var sheetDesc = channelSheet.getRange(row, videoDescriptionCol).getValue();
      var vidTitle = "";
      var vidDesc = "";
      var vidId = channelSheet.getRange(row, idCol).getValue();
      var change = false;

      try
      {
        var results = YouTube.Videos.list('snippet,statistics', {id: vidId, maxResults: 1, type: 'video'});
        results.items.forEach(function(item)
                              {
                                vidTitle = item.snippet.title;
                                vidDesc = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
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
        Logger.log(e + "\n" + vidId);
        errorLog.push(e + "\n[" + vidId + "]");
      }

      if (sheetTitle != vidTitle)
      {
        change = true;
        channelSheet.getRange(row, titleCol).setFormula(formatWikiHyperlink(vidTitle));
        errorLog.push(url + "\nOLD TITLE:\n" + sheetTitle + "\nNEW TITLE:\n" + vidTitle);
        changelog.push(["Titles", formatYouTubeHyperlink(vidId), formatWikiHyperlink(sheetTitle, wikiUrl), formatWikiHyperlink(vidTitle, wikiUrl)]);
      }

      if (sheetDesc != vidDesc)
      {
        change = true;
        var url = "[" + wikiUrl + formatWikiLink(vidTitle) + "]";
        channelSheet.getRange(row, videoDescriptionCol).setValue(vidDesc);
        errorLog.push(url + "\nOLD DESCRIPTION:\n" + sheetDesc + "\nNEW DESCRIPTION:\n" + vidDesc);
        changelog.push(["Descriptions", formatYouTubeHyperlink(vidId), formatWikiHyperlink(vidTitle, wikiUrl), sheetDesc.replace(/NEWLINE/g, "\n"), vidDesc.replace(/NEWLINE/g, "\n")]);
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
    Logger.log("Working on " + channels[i][0]);

    var channelSheet = spreadsheet.getSheetByName(channels[i][0]);
    var channelId = channels[i][1];
    var channelVideoIds = [];
    var missingVideoIds = [];
    var sheetVideoIds = channelSheet.getRange(2, idCol, channelSheet.getLastRow() - 1).getValues();
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
        Logger.log("Missing from sheet: " + channelVideoIds[k]);
    }
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

    var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    var data = JSON.parse(response.getContentText());
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
      var videoResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: playlistVideoIds[i]});
      var deletionId = videoResponse.items[0].id;
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
function addVideosById()
{
  /*
  var channelSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var wikiUrl = "https://siivagunner.fandom.com/wiki/";
  //*/
  /*
  var channelSheet = spreadsheet.getSheetByName("TimmyTurnersGrandDad");
  var wikiUrl = "https://ttgd.fandom.com/wiki/";
  //*/
  //*
  var channelSheet = spreadsheet.getSheetByName("VvvvvaVvvvvvr");
  var wikiUrl = "https://vvvvvavvvvvr.fandom.com/wiki/";
  //*/
  /*
  var channelSheet = spreadsheet.getSheetByName("Flustered Fernando");
  var wikiUrl = "https://flustered-fernando.fandom.com/wiki/";
  //*/
  var lastRow = channelSheet.getLastRow();
  var vidIds = [""];
  var nextPageToken = "";

  for (var i in vidIds)
  {
    var results = YouTube.Videos.list('snippet,contentDetails,statistics',{id: vidIds[i], maxResults: 1, type: 'video'});

    results.items.forEach(function(item)
                          {
                            var channelId = item.snippet.channelId;
                            var videoHyperlink = formatYouTubeHyperlink(vidIds[i]);
                            var wikiHyperlink = formatWikiHyperlink(item.snippet.title, wikiUrl);
                            var uploadDate = formatDate(item.snippet.publishedAt);
                            var length = item.contentDetails.duration.toString();
                            var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                            var viewCount = item.statistics.viewCount;
                            var likeCount = item.statistics.likeCount;
                            var dislikeCount = item.statistics.dislikeCount;
                            var commentCount = item.statistics.commentCount;

                            //*
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
                            //*/

                            //*
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
                            //*/
                          });
  }
}
