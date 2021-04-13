var spreadsheet = SpreadsheetApp.openById("1B7b9jEaWiqZI8Z8CzvFN1cBvLVYwjb5xzhWtrgs4anI");

var emailAddress = "a.k.zamboni@gmail.com";

var idCol = 1;
var titleCol = 2;
var wikiStatusCol = 3;
var videoStatusCol = 4;
var videoUploadDateCol = 5;
var videoLengthCol = 6;
var videoDescriptionCol = 7;
var videoViewsCol = 8;
var videoLikesCol = 9;
var videoDislikesCol = 10;
var videoCommentsCol = 11;

var lastUpdatedRowCol = 5;
var lastUpdatedTimeCol = 6;

// Update rip values and add missing rips
// This is the main function that manages most of the updating and managing of the spreadsheet
function checkSheet()
{
  Logger.log("Start");
  var startTime = new Date();
  var startDate = startTime.getDate();
  var startHour = startTime.getHours();
  var startMinute = startTime.getMinutes();
  var indexSheet = spreadsheet.getSheetByName("Index");
  var errorLog = [];
  var changelog = [];
  var channel = "SiIvaGunner";
  var updateCount = 0;

  if (startDate % 14 == 0 && startMinute >= 50)
    channel = "Flustered Fernando";
  else if (startDate % 4 == 0 && startMinute >= 50)
    channel = "VvvvvaVvvvvvr";
  else if (startMinute <= 10)
    channel = "TimmyTurnersGrandDad";

  switch(channel)
  {
    case "SiIvaGunner":
      var channelId = "UC9ecwl3FTG66jIKA9JRDtmg";
      var channelDatabaseId = 1;
      var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
      var wikiUrl = "https://siivagunner.fandom.com/wiki/";
      break;
    case "TimmyTurnersGrandDad":
      var channelId = "UCIXM2qZRG9o4AFmEsKZUIvQ";
      var channelDatabaseId = 3;
      var wikiUrl = "https://ttgd.fandom.com/wiki/";
      break;
    case "VvvvvaVvvvvvr":
      var channelId = "UCCPGE1kAoonfPsbieW41ZZA";
      var channelDatabaseId = 2;
      var wikiUrl = "https://vvvvvavvvvvr.fandom.com/wiki/";
      break;
    case "Flustered Fernando":
      var channelId = "UC8Q9CaWvV5_x90Z9VZ5cxmg";
      var wikiUrl = "https://flustered-fernando.fandom.com/wiki/";
  }

  var channelNames = indexSheet.getRange(1, 2, indexSheet.getLastRow() - 1).getValues();
  var index = channelNames.findIndex(channelName => {return channelName == channel});
  var indexRow = index + 3;

  var channelSheet = spreadsheet.getSheetByName(channel);

  Logger.log("Channel: " + channel);
  Logger.log("Hour: " + startHour);

  addNewVideos(channelId);
  checkNewArticles();

  var row = parseInt(indexSheet.getRange(indexRow, 2).getValue().replace(/.*row/g, ""));

  try
  {
    do
    {
      if (row >= channelSheet.getLastRow())
        row = 2;
      else
        row++;

      checkWikiStatus(row);
      Utilities.sleep(1000);
      checkVideoStatus(row);
      checkDescTitleStatus(row);

      updateCount++;
      var currentTime = new Date();
      var formattedTime = formatDate(currentTime).replace("   ", " ");

      indexSheet.getRange(indexRow, 2).setValue("Last updated " + formattedTime + " UTC on row " + row + ".");
    }
    while (updateCount < 40 && currentTime.getTime() - startTime.getTime() < 240000)
  }
  catch(e)
  {
    Logger.log(e);
  }

  if (errorLog.length > 0)
  {
    // Send an email notifying of any changes or errors.
    var subject = "SiIvaGunner Changelog Update";
    var message = "There are " + errorLog.length + " new changes.\n\n" + errorLog.join("\n\n").replace(/NEWLINE/g, "\n");

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



  // Check for newly uploaded videos
  function addNewVideos(channelId)
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

            var item = videoResponse.items[0];
            var channelId = item.snippet.channelId;
            var title = item.snippet.title;
            var wikiStatus = "Undocumented";
            var videoStatus = "Public";
            var uploadDate = formatDate(item.snippet.publishedAt);
            var length = item.contentDetails.duration.toString();
            var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
            var viewCount = item.statistics.viewCount;
            var likeCount = item.statistics.likeCount;
            var dislikeCount = item.statistics.dislikeCount;
            var commentCount = item.statistics.commentCount;

            if (commentCount.length == 0)
              commentCount = 0;

            if (channelDatabaseId)
            {
              var data = {
                "operation": "insert",
                "password": functionPassword,
                "rip":
                {
                  "videoId": videoId,
                  "title": title,
                  "slug": videoId,
                  "wikiStatus": wikiStatus,
                  "videoStatus": videoStatus,
                  "uploadDate": uploadDate,
                  "description": description.replace(/NEWLINE/g, "\n"),
                  "length": length,
                  "viewCount": viewCount.toString(),
                  "likeCount": likeCount.toString(),
                  "dislikeCount": dislikeCount.toString(),
                  "commentCount": commentCount.toString(),
                  "channelId": channelDatabaseId.toString()
                }
              };

              Logger.log("Insert " + videoId + " to database");
              var updateResponse = postToDatabase(data);
              Logger.log(updateResponse);

              if (updateResponse.indexOf("Error") != -1)
                errorLog.push(updateResponse);
            }

            channelSheet.insertRowAfter(lastRow);
            lastRow++;
            newVideoCount++;
            pageRipCount++;

            channelSheet.getRange(lastRow, idCol).setFormula(formatYouTubeHyperlink(videoId));
            channelSheet.getRange(lastRow, titleCol).setFormula(formatWikiHyperlink(title, wikiUrl));
            channelSheet.getRange(lastRow, wikiStatusCol).setValue(wikiStatus);
            channelSheet.getRange(lastRow, videoStatusCol).setValue(videoStatus);
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

    Logger.log("New rips: " + newVideoCount);
    channelSheet.getDataRange().sort({column: videoUploadDateCol, ascending: false});
    //row += newVideoCount;
  }



  // Check for new articles on the wiki
  function checkNewArticles()
  {
    var sheetTitles = channelSheet.getRange(2, titleCol, channelSheet.getLastRow() - 1).getValues();
    var url = wikiUrl + "Special:NewPages?limit=5";
    var wikiTitles = [];

    do
    {
      try
      {
        var responseText = UrlFetchApp.fetch(url).getContentText();
      }
      catch (e)
      {
        Logger.log(e);

        if (e.toString().indexOf("429") != -1)
          Utilities.sleep(30000);
        else
          Utilities.sleep(1000);

        var responseText = null;
      }
    }
    while (responseText == null)

    while (responseText.indexOf("mw-newpages-pagename") != -1)
    {
      if (responseText.indexOf("mw-newpages-pagename\" title=\"") != -1)
        var title = responseText.split("mw-newpages-pagename\" title=\"")[1].split("\">")[1].split("</a>")[0];
      else
        var title = responseText.split("mw-newpages-pagename\">")[1].split("<")[0];

      wikiTitles.push(title);
      responseText = responseText.replace("mw-newpages-pagename", "");
    }

    for (var i in wikiTitles)
    {
      wikiTitles[i] = wikiTitles[i].replace(/&#039;/g, "'").replace(/&amp;/g, "&");
      var index = sheetTitles.findIndex(titles => {return titles[0].replace(/#/g, "") == wikiTitles[i]});

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



  // Check if a rip has a wiki article
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
        Logger.log(e);
        Utilities.sleep(1000);
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

    Logger.log("Row " + row + ": " + title + " (wiki status " + responseCode + ")");

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



  // Check if video has been deleted, unlisted, etc.
  function checkVideoStatus(row)
  {
    var videoId = channelSheet.getRange(row, idCol).getValue();

    if (videoId == "Unknown")
      return;

    var title = channelSheet.getRange(row, titleCol).getValue();
    var currentStatus = channelSheet.getRange(row, videoStatusCol).getValue();
    var newStatus = "Unchanged";
    var url = "https://www.youtube.com/watch?v=" + videoId;

    do
    {
      try
      {
        var responseText = UrlFetchApp.fetch(url).getContentText();
        Utilities.sleep(1000);
      }
      catch (e)
      {
        Logger.log(e);

        if (e.toString().indexOf("429") != -1)
          Utilities.sleep(30000);
        else
          Utilities.sleep(1000);

        var responseText = null;
        var currentTime = new Date();

        if (currentTime.getTime() - startTime.getTime() > 240000)
         break;
      }
    }
    while (responseText == null)

    if (responseText == null)
    {
      Logger.log(title + " video status not found.");
      //errorLog.push(title + " video status not found. [" + videoId + "]\n" + responseText);
    }
    else if (responseText.indexOf('"isUnlisted":true') != -1)
    {
      if (currentStatus != "Unlisted")
        newStatus = "Unlisted";
    }
    else if (responseText.indexOf('"status":"OK"') != -1)
    {
      if (currentStatus != "Public")
        newStatus = "Public";
    }
    else if (responseText.indexOf('"This video is private."') != -1)
    {
      if (currentStatus != "Private")
        newStatus = "Private";
    }
    else if (responseText.indexOf('"status":"ERROR"') != -1)
    {
      if (currentStatus != "Deleted")
        newStatus = "Deleted";
    }
    else if (responseText.indexOf('"status":"UNPLAYABLE"') != -1)
    {
      if (currentStatus != "Unavailable")
        newStatus = "Unavailable";
    }

    Logger.log("Row " + row + ": " + title + " (" + newStatus + ")");

    if (newStatus != "Unchanged")
    {
      channelSheet.getRange(row, videoStatusCol).setValue(newStatus);
      errorLog.push(title + " was changed from " + currentStatus + " to " + newStatus + ".");
      changelog.push(["Statuses", formatYouTubeHyperlink(videoId), formatWikiHyperlink(title, wikiUrl), currentStatus, newStatus]);
    }
  }



  // Check if a video title or description has changed
  function checkDescTitleStatus(row)
  {
    var sheetTitle = channelSheet.getRange(row, titleCol).getValue();
    var videoStatus = channelSheet.getRange(row, videoStatusCol).getValue();
    var change = false;

    if (videoStatus == "Public" || videoStatus == "Unlisted" || videoStatus == "Unavailable")
    {
      var sheetDescription = channelSheet.getRange(row, videoDescriptionCol).getValue();
      var videoId = channelSheet.getRange(row, idCol).getValue();
      var videoTitle = null;
      var videoDescription = null;

      try
      {
        var videoResponse = YouTube.Videos.list('snippet,statistics', {id: videoId, maxResults: 1, type: 'video'});

        var item = videoResponse.items[0];
        var videoTitle = item.snippet.title;
        var videoDescription = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");

        var viewCount = item.statistics.viewCount;
        var likeCount = item.statistics.likeCount;
        var dislikeCount = item.statistics.dislikeCount;
        var commentCount = item.statistics.commentCount;

        if (commentCount.length == 0)
          commentCount = 0;

        channelSheet.getRange(row, videoViewsCol).setValue(viewCount);
        channelSheet.getRange(row, videoLikesCol).setValue(likeCount);
        channelSheet.getRange(row, videoDislikesCol).setValue(dislikeCount);
        channelSheet.getRange(row, videoCommentsCol).setValue(commentCount);
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
    Logger.log("Row " + row + ": " + sheetTitle + " (desc/title change " + change + ")");
  }
}



// Checks to see if any public uploaded rips are missing from the spreadsheet
function checkPublicVideos()
{
  var channels = [["SiIvaGunner", "UC9ecwl3FTG66jIKA9JRDtmg", 1],
                  ["TimmyTurnersGrandDad", "UCIXM2qZRG9o4AFmEsKZUIvQ", 3],
                  ["VvvvvaVvvvvvr", "UCCPGE1kAoonfPsbieW41ZZA", 2],
                  ["Flustered Fernando", "UC8Q9CaWvV5_x90Z9VZ5cxmg", null],
                  ["SiIvaGunner2", "UCYGz7FZImRL8oI68pD7NoKg", null],
                  ["GilvaSunner", "UCraDChjPs-r9FoNsmJufZZQ", null]];

  for (var i in channels)
  {
    var channelTitle = channels[i][0];
    var channelId = channels[i][1];
    var channelDatabaseId = channels[i][2];

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

    for (var k in channelVideoIds)
    {
      var index = sheetVideoIds.findIndex(ids => {return ids[0] == channelVideoIds[k]});

      if (index == -1)
        missingVideoIds.push(channelVideoIds[k]);
    }

    for (var k in missingVideoIds)
      Logger.log("Missing from spreadsheet: " + missingVideoIds[k]);

    // Add missing videos to the corresponding sheet and database table
    addRipsToSheet(missingVideoIds, channelTitle);

    if (channelDatabaseId != null && missingVideoIds.length > 0)
    {
      var subject = "SiIvaGunner Spreadsheet Missing IDs";
      var message = "Missing from spreadsheet: " + missingVideoIds.join(", ");

      MailApp.sendEmail(emailAddress, subject, message);
      Logger.log("Email successfully sent.");

      addRipsToDatabase(missingVideoIds, channelTitle, channelDatabaseId);
    }
  }
}



// Checks to see if any deleted, privated, or unlisted rips are missing from the spreadsheet
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
        var responseText = UrlFetchApp.fetch(url).getContentText();
      }
      catch (e)
      {
        Logger.log(e);

        if (e.toString().indexOf("429") != -1)
          Utilities.sleep(30000);
        else
          Utilities.sleep(1000);

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



// Checks to see what rips in the undocumented rips playlist should or shouldn't be there
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



// For manually adding rips to the spreadsheet
function addRipsToSheet(videoIds, channel)
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
    do
    {
      try
      {
        var videoResponse = YouTube.Videos.list('snippet,contentDetails,statistics',{id: videoIds[i], maxResults: 1, type: 'video'});
        var e = "";
      }
      catch (e) {}
    }
    while (e != "")

    var item = videoResponse.items[0];
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

    if (commentCount.length == 0)
      commentCount = 0;

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

      Logger.log("Added " + item.snippet.title + " to " + channel);
    }
  }
}



// Sends a post request to a cloud hosted function
function postToDatabase(data)
{
  var options = {
        'method' : 'post',
        'contentType': 'application/json',
        'payload' : JSON.stringify(data)
      };

  Logger.log(JSON.stringify(data).replace(functionPassword, "IT'S A SECRET TO EVERYBODY."));

  var updateResponse = UrlFetchApp.fetch(dbUrl, options).getContentText();

  return updateResponse;
}



// Updates the titles, descriptions, views, etc. of rips from a channel in the database
function updateDatabase()
{
  var startTime = new Date();
  var startHour = startTime.getHours();
  var channel = "SiIvaGunner";
  var range = "second half";

  if (startHour < 6)
    channel = "TimmyTurnersGrandDad";
  else if (startHour < 15)
    channel = "VvvvvaVvvvvvr";

  if (channel == "TimmyTurnersGrandDad")
    range = "full";
  if ((startHour < 11 && channel == "VvvvvaVvvvvvr") || (startHour < 20 && channel == "SiIvaGunner"))
    range = "first half";

  Logger.log("Updating the " + range + " range of " + channel);

  var channelSheet = spreadsheet.getSheetByName(channel);
  var row = 2;
  var rowCount = channelSheet.getLastRow() - 1;

  if (range == "first half" || range == "second half")
    rowCount = Math.ceil(rowCount / 2);

  if (range == "second half")
    row = rowCount + 2;

  var videoIds = channelSheet.getRange(row, idCol, rowCount).getValues();
  var titles = channelSheet.getRange(row, titleCol, rowCount).getValues();
  var wikiStatuses = channelSheet.getRange(row, wikiStatusCol, rowCount).getValues();
  var videoStatuses = channelSheet.getRange(row, videoStatusCol, rowCount).getValues();
  var descriptions = channelSheet.getRange(row, videoDescriptionCol, rowCount).getValues();
  var viewCounts = channelSheet.getRange(row, videoViewsCol, rowCount).getValues();
  var likeCounts = channelSheet.getRange(row, videoLikesCol, rowCount).getValues();
  var dislikeCounts = channelSheet.getRange(row, videoDislikesCol, rowCount).getValues();
  var commentCounts = channelSheet.getRange(row, videoCommentsCol, rowCount).getValues();
  var rips = [];

  for (var i in videoIds)
  {
    if (!videoIds[i][0])
      break;

    var ripData = {
      "videoId": videoIds[i][0],
      "title": titles[i][0],
      "wikiStatus": wikiStatuses[i][0],
      "videoStatus": videoStatuses[i][0],
      "description": descriptions[i][0].toString().replace(/NEWLINE/g, "\n"),
      "viewCount": viewCounts[i][0].toString(),
      "likeCount": likeCounts[i][0].toString(),
      "dislikeCount": dislikeCounts[i][0].toString(),
      "commentCount": commentCounts[i][0].toString(),
    };

    rips.push(ripData);
    row++;
  }

  var data = {
    "operation": "update",
    "password": functionPassword,
    "rips": rips
  };

  Logger.log("Selected " + videoIds.length + " rips from " + channel);
  var updateResponse = postToDatabase(data);
  Logger.log(updateResponse);

  if (updateResponse.indexOf("Error") != -1)
  {
    var subject = "SiIvaGunner Database Update Error";

    MailApp.sendEmail(emailAddress, subject, updateResponse);
    Logger.log("Email successfully sent.");
  }
}



// Checks a channel in the database for missing rips
function checkDatabase()
{
  var startTime = new Date();
  var startHour = startTime.getHours();
  var channel = "SiIvaGunner";
  var channelDatabaseId = 1;

  if (startHour < 12)
  {
    channel = "TimmyTurnersGrandDad";
    channelDatabaseId = 3;
  }

  var channelSheet = spreadsheet.getSheetByName(channel);
  var videoIds = channelSheet.getRange("A2:A").getValues();

  for (var i in videoIds)
    videoIds[i] = videoIds[i][0];

  var data = {
    "operation": "check",
    "password": functionPassword,
    "channelId": channelDatabaseId,
    "videoIds": videoIds,
  };

  Logger.log(channel + " has " + videoIds.length + " rips");
  var updateResponse = postToDatabase(data);
  Logger.log(updateResponse);

  updateResponse = updateResponse.replace("Missing IDs: ", "").split(", ");

  if (updateResponse != "" || updateResponse.indexOf("Error") != -1)
  {
    if (updateResponse != "")
      var subject = "SiIvaGunner Database Missing IDs";
    else
      var subject = "SiIvaGunner Database Check Error";

    MailApp.sendEmail(emailAddress, subject, updateResponse);
    Logger.log("Email successfully sent.");

    if (updateResponse != "")
      addRipsToDatabase(updateResponse, channel, channelDatabaseId);
  }
}



// For manually adding rips to the database
function addRipsToDatabase(idsToAdd, channel, channelDatabaseId)
{
  var channelSheet = spreadsheet.getSheetByName(channel);
  var ids = channelSheet.getRange("A2:A").getValues();

  for (var i in idsToAdd)
  {
    var videoId = idsToAdd[i];

    var index = ids.findIndex(ids => {return ids[0] == videoId});

    if (index != -1)
    {
      var row = index + 2;

      var title = channelSheet.getRange(row, titleCol).getValue();
      var wikiStatus = channelSheet.getRange(row, wikiStatusCol).getValue();
      var videoStatus = channelSheet.getRange(row, videoStatusCol).getValue();
      var uploadDate = channelSheet.getRange(row, videoUploadDateCol).getValue();
      var length = channelSheet.getRange(row, videoLengthCol).getValue();
      var description = channelSheet.getRange(row, videoDescriptionCol).getValue().replace(/NEWLINE/g, "\n");
      var viewCount = channelSheet.getRange(row, videoViewsCol).getValue();
      var likeCount = channelSheet.getRange(row, videoLikesCol).getValue();
      var dislikeCount = channelSheet.getRange(row, videoDislikesCol).getValue();
      var commentCount = channelSheet.getRange(row, videoCommentsCol).getValue();

      var data = {
        "operation": "insert",
        "password": functionPassword,
        "rip":
        {
          "videoId": videoId,
          "title": title,
          "slug": videoId,
          "wikiStatus": wikiStatus,
          "videoStatus": videoStatus,
          "uploadDate": uploadDate,
          "description": description.replace(/NEWLINE/g, "\n"),
          "length": length,
          "viewCount": viewCount.toString(),
          "likeCount": likeCount.toString(),
          "dislikeCount": dislikeCount.toString(),
          "commentCount": commentCount.toString(),
          "channelId": channelDatabaseId.toString()
        }
      };

      Logger.log("Insert " + videoId + " to database");
      var updateResponse = postToDatabase(data);
      Logger.log(updateResponse);
    }
    else
      Logger.log(videoId + " not found");
  }
}



// Format a date for the spreadsheet
function formatDate(date, style)
{
  if (typeof date == "string")
    date = date.replace("T", "   ").replace("Z", "").replace(".000Z", "");
  else
    date = Utilities.formatDate(date, "UTC", "yyyy-MM-dd   HH:mm:ss");

  return date;
}



// Format to a more easily readable string (WIP)
function formatLength(length)
{
  for (var i = 0; i < length.length; i++)
  {
    if (length.charAt(i) == "T" && length.charAt(i + 2) == "S")
      length = length.replace("PT", "0:0");
    else if (length.charAt(i) == "T" && length.charAt(i + 3) == "S")
      length = length.replace("PT", "0:");
    else if (length.charAt(i) == "M" && length.charAt(i + 2) == "S")
      length = length.replace("M", ":0");
    if (length.charAt(i) == "H" && length.charAt(i + 2) == "M")
      length = length.replace("H", ":0");
  }

  if (length.indexOf("S") == -1)
    length += "00";

  length = length.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "");

  return length;
}



// Formats a YouTube hyperlink function for the spreadsheet
function formatYouTubeHyperlink(str)
{
  str = '=HYPERLINK("https://www.youtube.com/watch?v=' + str + '", "' + str + '")';
  return str;
}



// Formats a wiki hyperlink function for the spreadsheet
function formatWikiHyperlink(str, wikiUrl)
{
  if (wikiUrl == null)
    wikiUrl = "https://siivagunner.fandom.com/wiki/";

  str = str.replace(/Reupload: /g, "").replace(/Reup: /g, "");
  var simpleStr = str.replace(/"/g, '""').replace(/ \(GiIvaSunner\)/g, "");

  str = '=HYPERLINK("' + wikiUrl + formatWikiLink(str) + '", "' + simpleStr + '")';
  return str;
}



// Replaces bad url characters and banned words
function formatWikiLink(str)
{
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/\{/g, '(');
  str = str.replace(/\}/g, ')');
  str = str.replace(/#/g, '');
  str = str.replace(/\​\|\​_/g, 'L');
  str = str.replace(/\|/g, '');
  str = str.replace(/Nigga/g, 'N----');
  return encodeURIComponent(str);
}
