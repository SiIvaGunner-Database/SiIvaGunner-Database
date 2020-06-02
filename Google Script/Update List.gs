var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var uploadsSheet = spreadsheet.getSheetByName("List of Rips");
var summarySheet = spreadsheet.getSheetByName("Summary");
var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
var channelId = "UC9ecwl3FTG66jIKA9JRDtmg"
var errorLog = [];

// Add new rips to list.
function addNewVideos()
{
  var mostRecent = uploadsSheet.getRange("D2").getValue();
  var currentTotal = summarySheet.getRange("B1").getValue();
  var row = currentTotal + 2;
  var newRipCount = 0;
  var results = YouTube.Channels.list('contentDetails', {id: channelId});

  for (var i in results.items)
  {
    var item = results.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
    var playlistResponse = YouTube.PlaylistItems.list('snippet,contentDetails', {playlistId: uploadsPlaylistId, maxResults: 50});

    Logger.log("Most recent upload date: " + mostRecent);
    for (var j = 0; j < playlistResponse.items.length; j++)
    {
      var playlistItem = playlistResponse.items[j];
      var publishDate = playlistItem.snippet.publishedAt.replace(/.000Z/g, "Z");

      if (publishDate > mostRecent)
      {
        var originalTitle = playlistItem.snippet.title;
        var encodedTitle = format(originalTitle);
        var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
        var id = playlistItem.snippet.resourceId.videoId;
        var description = playlistItem.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");

        updateWikiStatus(row, url, originalTitle, id, true);
        uploadsSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
        uploadsSheet.getRange(row, 4).setValue(publishDate);
        uploadsSheet.getRange(row, 6).setValue(description);
        uploadsSheet.getRange(row, 7).setValue("Public");
        uploadsSheet.getRange(row, 8).setValue("1");

        var results = YouTube.Videos.list('contentDetails',{id: id, maxResults: 1, type: 'video'});

        results.items.forEach(function(item)
                              {
                                var length = item.contentDetails.duration.toString();
                                uploadsSheet.getRange(row, 5).setValue(length);
                              });

        Logger.log("Row " + row + ": " + originalTitle + " - " + publishDate);
        row++;
        newRipCount++;
      }
    }
  }
  var lastUpdatedRow = summarySheet.getRange("E2").getValue();
  summarySheet.getRange("E2").setValue(lastUpdatedRow + newRipCount);
  lastUpdatedRow = summarySheet.getRange("E3").getValue();
  summarySheet.getRange("E3").setValue(lastUpdatedRow + newRipCount);
  lastUpdatedRow = summarySheet.getRange("E4").getValue();
  summarySheet.getRange("E4").setValue(lastUpdatedRow + newRipCount);
  Logger.log("New rips: " + newRipCount);
}

// Update rip values and add missing rips.
function updateList()
{
  var startTime = new Date();
  var currentHour = Utilities.formatDate(new Date(), "UTC", "HH");

  if (currentHour < 22)
    var recentUpdateRanges = ["E2", "F2"];
  else if (currentHour == 22)
    var recentUpdateRanges = ["E3", "F3"];
  else if (currentHour == 23)
    var recentUpdateRanges = ["E4", "F4"];

  uploadsSheet.getRange("A2:I19000").sort({column: 4, ascending: false});
  addNewVideos();
  uploadsSheet.getRange("A2:I19000").sort({column: 4, ascending: false});

  var currentTotal = summarySheet.getRange("B1").getValue();
  var row = summarySheet.getRange(recentUpdateRanges[0]).getValue();
  var ready = true;

  for (var i = 2; i < 21; i++)
    updateRow(i);

  while (ready)
  {
    if (row == currentTotal + 1)
    {
      if (currentHour < 22)
        row = 22;
      else
        row = 2;
    } else
      row++;

    if (currentHour < 22)
      updateRow(row);
    else if (currentHour == 22)
      updateVideoStatus(row);
    else if (currentHour == 23)
      updateDescTitleStatus(row);

    var currentTime = new Date();
    var currentTimeUtc = Utilities.formatDate(new Date(), "UTC", "MM/dd/yy HH:mm:ss");
    summarySheet.getRange(recentUpdateRanges[0]).setValue(row);
    summarySheet.getRange(recentUpdateRanges[1]).setValue(currentTimeUtc);

    // Check if the script timer has passed a specified time limit.
    if (currentTime.getTime() - startTime.getTime() > (10 * 60 * 500)) // 5 minutes
    {
      if (errorLog.length > 0)
      {
        var emailAddress = "a.k.zamboni@gmail.com";
        var subject = "List of Uploads Alert";
        var message = "There are " + errorLog.length + " new alerts.\n\n" + errorLog.toString().replace(/,/g, "\n\n");

        MailApp.sendEmail(emailAddress, subject, message);
        Logger.log("Email successfully sent. " + message);
      }
      ready = false;
    }
  }
}

function updateRow(row)
{
  // Start temporary code.
  var date = uploadsSheet.getRange(row, 4).getValue();
  uploadsSheet.getRange(row, 4).setValue(date.replace(/.000Z/g, "Z"));
  // End temporary code.

  var originalTitle = uploadsSheet.getRange(row, 1).getValue();
  var encodedTitle = format(originalTitle);
  var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
  var oldStatus = uploadsSheet.getRange(row, 2).getValue();
  var id = uploadsSheet.getRange(row, 3).getValue();

  updateWikiStatus(row, url, originalTitle, id, false);

  var newStatus = uploadsSheet.getRange(row, 2).getValue();

  if (oldStatus != newStatus && newStatus == "No") // The rip no longer needs an article
  {
    Logger.log("Remove from playlist: " + originalTitle);
    try
    {
      var videoResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: id});
      var deletionId = videoResponse.items[0].id;
      YouTube.PlaylistItems.remove(deletionId);
    } catch (e)
    {
      e = e.toString().replace(/\n\n/g, "\n");
      Logger.log(e + "\n" + url);
      errorLog.push(e + "\n[" + url + "]");
    }
  }
  else if (oldStatus != newStatus && newStatus == "Yes") // The rip needs an article
  {
    Logger.log("Add to playlist: " + originalTitle);
    YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: id}}}, "snippet");
  }
  Logger.log("Row " + row + ": " + originalTitle + " (" + oldStatus + ", " + newStatus + ")");
}

// Check if the rip has a wiki article.
function updateWikiStatus(row, url, originalTitle, id, newRip)
{
  try
  {
    var response = UrlFetchApp.fetch(url).getResponseCode();

    uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') + '")');
    uploadsSheet.getRange(row, 2).setValue("No");
  } catch (e)
  {
    e = e.toString().replace(/\n\n/g, "\n");
    if (e.indexOf("404") != -1)
    {
      uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') +'")');
      uploadsSheet.getRange(row, 2).setValue("Yes");

      if (newRip)
      {
        Logger.log("Add: " + originalTitle);
        YouTube.PlaylistItems.insert({snippet: {playlistId: playlistId, resourceId: {kind: "youtube#video", videoId: id}}}, "snippet");
      }
    }
    else
    {
      if (newRip)
        uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') + '")');

      if (uploadsSheet.getRange(row, 2).getValue() == "")
        uploadsSheet.getRange(row, 2).setValue("Unknown");

      if (e.indexOf("Address unavailable") == -1)
      {
        Logger.log(e + "\n" + url);
        errorLog.push(e + "\n[" + url + "]")
      }
    }
  }
}

function updateVideoStatus(row)
{
  var title = uploadsSheet.getRange(row, 1).getValue();
  var vidId = uploadsSheet.getRange(row, 3).getValue();
  var currentStatus = uploadsSheet.getRange(row, 7).getValue();
  var url = "https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=" + vidId + "&format=json";

  try
  {
    var response = UrlFetchApp.fetch(url).getResponseCode();
    uploadsSheet.getRange(row, 7).setValue("Public");
  } catch (e)
  {
    e = e.toString().replace(/\n\n/g, "\n");
    if (e.indexOf("404") != -1)
    {
      if (currentStatus != "Deleted")
        errorLog.push(title + " has been deleted.");

      uploadsSheet.getRange(row, 7).setValue("Deleted");
    }
    else if (e.indexOf("401") != -1)
    {
      if (currentStatus != "Private")
        errorLog.push(title + " has been privated.");

      uploadsSheet.getRange(row, 7).setValue("Private");
    }
    else
    {
      if (uploadsSheet.getRange(row, 7).getValue() == "")
        uploadsSheet.getRange(row, 7).setValue("Unknown");

      if (e.indexOf("Address unavailable") == -1)
      {
        Logger.log(e + "\n" + url);
        errorLog.push(e + "\n[" + url + "]");
      }
    }
  }
  Logger.log("Row " + row + ": " + title + " (" + response + ")");
}

function updateDescTitleStatus(row)
{
  var sheetTitle = uploadsSheet.getRange(row, 1).getValue();
  var videoStatus = uploadsSheet.getRange(row, 7).getValue();

  if (videoStatus == "Public" || videoStatus == "Normal")
  {
    var sheetDesc = uploadsSheet.getRange(row, 6).getValue();
    var vidTitle = "";
    var vidDesc = "";
    var vidId = uploadsSheet.getRange(row, 3).getValue();
    var change = false;

    try
    {
      var results = YouTube.Videos.list('snippet', {id: vidId, maxResults: 1, type: 'video'});
      results.items.forEach(function(item)
                            {
                              vidTitle = item.snippet.title;
                              vidDesc = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                            });
    } catch(e)
    {
      e = e.toString().replace(/\n\n/g, "\n");
      Logger.log(e + "\n" + vidId);
      errorLog.push(e + "\n[" + vidId + "]");
    }

    if (sheetTitle != vidTitle)
    {
      change = true;
      var url = "https://siivagunner.fandom.com/wiki/" + format(vidTitle);
      var urlRow = '=HYPERLINK("' + url + '", "' + vidTitle.replace(/"/g, '""') +'")';
      uploadsSheet.getRange(row, 1).setFormula(urlRow);
      errorLog.push("[" + url + "]\nOLD TITLE:\n" + sheetTitle + "\nNEW TITLE:\n" + vidTitle);
    }

    if (sheetDesc != vidDesc)
    {
      change = true;
      var url = "https://siivagunner.fandom.com/wiki/" + format(vidTitle);
      uploadsSheet.getRange(row, 6).setValue(vidDesc);
      errorLog.push("[" + url + "]\nOLD DESCRIPTION:\n" + sheetDesc + "\nNEW DESCRIPTION:\n" + vidDesc);
    }
  }
  Logger.log("Row " + row + ": " + sheetTitle + " (" + change + ")");
}

function format(str)
{
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/#/g, '');
  str = str.replace(/\​\|\​_/g, 'L');
  str = str.replace(/\|/g, '∣');
  return encodeURIComponent(str);
}

// Checks to see if any uploaded rips are missing from the spreadsheet.
function checkForMissingRips()
{
  var currentTotal = summarySheet.getRange("B1").getValue() + 1;
  var range = "C2:C" + currentTotal;
  var ripIds = uploadsSheet.getRange(range).getValues();
  var vidIds = [];
  var missingRips = [];
  var results = YouTube.Channels.list('contentDetails', {id: channelId});

  for (var i in results.items)
  {
    var item = results.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
    var nextPageToken = '';
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
      missingRips.push(vidIds[i])
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
                              var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
                              var urlRow = '=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') +'")';
                              var nameRow = '=HYPERLINK("https://www.youtube.com/watch?v=' + vidId + '", "' + vidId + '")';
                              var length = item.contentDetails.duration.toString();
                              var description = item.snippet.description.toString().replace(/\r/g, "").replace(/\n/g, "NEWLINE");
                              Logger.log("\n" + urlRow + "\n" + nameRow + "\n" + publishDate + "\n" + length + "\n" + description);
                            });
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
  var currentTotal = summarySheet.getRange("B1").getValue();
  var mostRecent = uploadsSheet.getRange("D2").getValue();

  var results = YouTube.Channels.list('contentDetails', {id: channelId});
  var scheduled = false;

  for (var i in results.items)
  {
    var item = results.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
    var nextPageToken = '';
    var row = 1;

    while (nextPageToken != null)
    {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken});

      for (var j = 0; j < playlistResponse.items.length; j++)
      {
        row++;
        if (row > currentTotal + 1)
        {
          var playlistItem = playlistResponse.items[j];
          var originalTitle = playlistItem.snippet.title;
          var encodedTitle = format(originalTitle);
          var id = playlistItem.snippet.resourceId.videoId;
          var publishDate = playlistItem.snippet.publishedAt;

          var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;

          updateWikiStatus(row, url, originalTitle, id, true);

          uploadsSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
          uploadsSheet.getRange(row, 4).setValue(publishDate);

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
        uploadsSheet.getRange("A2:P19000").sort({column: 4, ascending: false});
        if (scheduled) break;
      }
      if (scheduled) break;
    }
  }
}
