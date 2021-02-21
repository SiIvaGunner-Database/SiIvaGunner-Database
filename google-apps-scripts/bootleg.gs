var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var channels = [["How to properly clean your metal computer", "UCRPj5iCNYgvUMBq8Tga68hw"],
                ["Giivλ­Sunner", "UCOrh4EtSPV8BZoK2o9cxCxg"],
                ["Brawl­BRSTMs3 X", "UCk8uORkwM6prnfmK2Blpfnw"],
                ["record­collector1972", "UCiGK0KvXhB2D7bKSz-b3y0w"],
                ["Silva­Latina­Gunner", "UCf-OlLPEwmjIlqavCM8-Mlg"],
                ["Silvio­Gunner", "UCzqiNG9Ii8L3dZzLI90VDPA"],
                ["ViIga­Nusser", "UC97EJOCwh3eDyXt5fyZjZ4w"],
                ["YoshiGunner", "UCCqAAU6LTZSX8ZcCpI_dpyg"],
                ["ViIva­Nunner", "UCx8R_K46oW7-3WMFVqQBAIQ"],
                ["Nooba­Zunner", "UCNt0UThru4-_M4D9K7QLk-g"],
                ["Rinsa­VuIIer", "UC4c9zsxHsynJMqbM1I3TFwg"],
                ["Сильва­Оружейник", "UCnWDgEZ_aozAnFf1MRpkt5Q"],
                ["Sulva­Ginner", "UC2YKR5iZfRzTqGRisrJZ1BA"],
                ["BIizza­Stunner", "UCyIOZ0aXWJjCfR3A4HcxLdg"],
                ["Nafun", "UC_t0SR_fr1uwHaR4QaQ0j_g"],
                ["BaldiGunner", "UChYWqGkZNA8nNIGS400NFuw"],
                ["Brawlcats Music", "UCYMQ-W0yVBWxgpxymqPxneg"],
                ["CubiiPostter", "UCegJwAR3I1tsMzSA0Xgmqvg"],
                ["Dannver Devita", "UCMHMSEDbS4wjFcrz2c7BKPQ"],
                ["HiipaSpooker", "UC2wQUZ0srgIRRRxwXrttRxw"],
                ["iascas", "UCsuMYmeXXW97EsmfhPRTBBA"],
                ["Jazva Sketcher", "UC5wZLii1wRuDwyK0h2GUMcQ"],
                ["King of Benches", "UCRTR1EhG01bfkKJ8m95X6TA"],
                ["MarF41", "UCS2oUGwdEa2sqJaWIo2y3FA"],
                ["Memesauce", "UCGeR1r5bwdEK3SIUvzTM0jA"],
                ["Mr. High Quality", "UC3dp1-DZE0leNyXTcr1hN6w"],
                ["Mysikt", "UCnv4xkWtbqAKMj8TItM6kOA"],
                ["p0tato_5alad", "UCIMc-TT2wWA746gugi42cFw"],
                ["SiIvaCummer", "UCebHf-GKUpYNCgycP9m9OeQ"],
                ["SiIvaGunner's Son", "UCAdJlmbIv96bx40cxay49_g"],
                ["SilvaTrasheurs", "UCkWYqYNrolOpAoK3sFiaCUQ"],
                ["BraSilvaGunner", "UCA3XSmknj7C6TXhK31zMabQ"],
                ["ChriIva Brunner", "UC4hH5KDotgrpaWuF6885mJw"],
                ["GlIlvaSunner", "UCkbSuw61MTlJFV_ctlu003A"],
                ["GoldGunner", "UCxVwm8d3eXkX8maUOrTDkBA"],
                ["GrandPappyMehrio", "UCd6Ku-pzu5j2JCnWK5dgigw"],
                ["IivaUnner", "UCO4Arbs_v8k2_3ombdRfpGQ"],
                ["IkaGunner", "UCoBe8vuwHqRgchGRvEFsxNw"],
                ["IzzaKarter", "UCZszfKwJBrixdOMDOhYwxMg"],
                ["Janultimativ", "UC6p0EwJHGhIfHRZxjvkO_BA"],
                ["MovedGunner", "UCAePrQcR13XpQ8YgDm-x4fw"],
                ["Music - Topic", "UC_iDxCm1rLb4Me-wFzRvvyw"],
                ["RipShitLikeThis", "UCgQSatBjitROBESOUfuVLKQ"],
                ["SnowvaGunner", "UCfLQe7UTTpvKq_UPXWebukA"],
                ["SuggaGugga", "UCSMg3UzAc-REfbzVshbOYQQ"],
                ["ThatOneTVGuy", "UCyAiVPkhVDz_URbmxUzwRmg"],
                ["BunnbotPrime", "UCVIxVBMp0Bt3LQhAoE1VOIw"],
                ["PiIvaFunner", "UC4ScqGCH_ZEZzSqowAU9o7Q"],
                ["SNick!", "UCojOOkqnurrWRo-MiwHyplA"],
                ["1d!eCI0ak", "UClLuMiMV8_3Jduacitpdp1Q"],
                ["DeoxisPryme", "UCND7auxL9CRGhLo6fu1Tfdw"],
                ["Dinkleberg", "UCIAJnlYsz5e0D_OGeTu6hhg"],
                ["EE ROCKK", "UCk3JcFqGQu5YqK8drELltUg"],
                ["EIu Tran", "UCOKS1QCxTSz7p_GWIuGi2dg"],
                ["GIivaSunner", "UC_mbYgsetZAeufHgXDwBlAw"],
                ["HiintaLorder", "UC8aWTYTbLlq0ppeivTEZZjw"],
                ["LingaSuvver", "UC2fxx38fCP-I1E04NeG_6Ig"],
                ["Low Quality RipsTM", "UC4Y1xdX2_-bK3_bHvjuNMqg"],
                ["Neurax BiivaFucker", "UCHQgKgyAVZKXDs1hicVa2BQ"],
                ["NiIsaVugger", "UCXKpiIiO489wJElzI9rFwPA"],
                ["RiIvavunner", "UC5SyZgLiUIDlB3jCLPxfiow"],
                ["RinkaNuIIer", "UCKm8qmZsJOaCnn8O-xVM4LA"],
                ["SiIvaGunner", "UC3QRHrJm7YlZdyi6bJjK7Ew"],
                ["WoopaCrunner", "UCC_yBZLT9JAocDFHg0uCtiw"]];

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

function formatDate(date, style)
{
  if (typeof date == "string")
    date = date.replace("T", "   ").replace("Z", "").replace(".000Z", "");
  else
    date = Utilities.formatDate(date, "UTC", "yyyy-MM-dd   HH:mm:ss");

  return date;
}

function formatYouTubeHyperlink(str)
{
  str = '=HYPERLINK("https://www.youtube.com/watch?v=' + str + '", "' + str + '")';
  return str;
}

function checkBootlegSheetTrigger()
{
  ScriptApp.newTrigger("checkBootlegSheet")
  .timeBased()
  .everyMinutes(5)
  .create();
}

// Checks to see if any public uploaded rips are missing from the spreadsheet.
function checkPublicVideos()
{
  Logger.log("There are " + channels.length + " channels");

  for (var i in channels)
  {
    var channelTitle = channels[i][0];
    var channelId = channels[i][1];

    Logger.log("Working on " + channelTitle);

    // If the channel doesn't have a sheet, then copy template to new channel sheet
    var exists = spreadsheet.getSheetByName(channelTitle);

    if (!exists)
    {
      var sheet = spreadsheet.getSheetByName('Template').copyTo(spreadsheet);
      sheet.setName(channelTitle);
    }

    var summarySheet = spreadsheet.getSheetByName("Index");

    //summarySheet.getRange((parseInt(i) + 1) * 4 + 2, 2).setValue(channelTitle);
    //summarySheet.getRange((parseInt(i) + 1) * 4 + 3, 2).setValue('="Currently has " & COUNTIF(\'' + channelTitle + '\'!A2:A, "*") & " rips listed."');
    //summarySheet.getRange((parseInt(i) + 1) * 4 + 4, 2).setValue("Last updated at 2021-01-01 00:00:00 UTC on row 1.");
    //summarySheet.getRange((parseInt(i) + 1) * 4 + 5, 2).setValue("");

    //*
    if (channelTitle.indexOf(" ") == -1 && channelTitle.indexOf("!") == -1)
      summarySheet.getRange(i * 4 + 2, 2).setFormula('=COUNTIF(' + channelTitle.replace(/'/g, "''") + '!A2:A, "*")');
    else
      summarySheet.getRange(i * 4 + 2, 2).setFormula('=COUNTIF(\'' + channelTitle.replace(/'/g, "''") + '\'!A2:A, "*")');

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

    // Optionally, add all missing videos to the corresponding sheet.
    addVideosById(missingVideoIds, channelTitle);

    if (channelSheet.getRange(2, 1).getValue() == "a")
      channelSheet.deleteRow(2);

    channelSheet.getDataRange().sort({column: videoUploadDateCol, ascending: false});
    //*/
  }
}

// Add new video information to sheet using the IDs provided.
function addVideosById(videoIds, channel)
{
  var channelSheet = spreadsheet.getSheetByName(channel);
  var lastRow = channelSheet.getLastRow();

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

    videoResponse.items.forEach(function(item)
                                {
                                  var channelId = item.snippet.channelId;
                                  var videoHyperlink = formatYouTubeHyperlink(videoIds[i]);
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

                                  channelSheet.getRange(lastRow, idCol).setFormula(videoHyperlink);
                                  channelSheet.getRange(lastRow, titleCol).setValue(title);
                                  channelSheet.getRange(lastRow, videoStatusCol).setValue("Public");
                                  channelSheet.getRange(lastRow, videoUploadDateCol).setValue(uploadDate);
                                  channelSheet.getRange(lastRow, videoLengthCol).setValue(length);
                                  channelSheet.getRange(lastRow, videoDescriptionCol).setValue(description);
                                  channelSheet.getRange(lastRow, videoViewsCol).setValue(viewCount);
                                  channelSheet.getRange(lastRow, videoLikesCol).setValue(likeCount);
                                  channelSheet.getRange(lastRow, videoDislikesCol).setValue(dislikeCount);
                                  channelSheet.getRange(lastRow, videoCommentsCol).setValue(commentCount);
                                });
  }
}

function checkBootlegSheet()
{
  var startTime = new Date();
  var indexSheet = spreadsheet.getSheetByName("Index");
  var errorLog = [];
  var changelog = [];
  var updateCount = 0;

  var lastUpdatedChannel = indexSheet.getRange(5, 2).getValue().replace("Last updated: ", "");
  var index = channels.findIndex(channel => {return channel[0] == lastUpdatedChannel});

  if (index == channels.length - 1)
    index = 0;
  else
    index++;

  var channel = channels[index][0];
  var channelId = channels[index][1];

  indexSheet.getRange(5, 2).setValue("Last updated: " + channels[index][0])

  var channelNames = indexSheet.getRange(1, 2, indexSheet.getLastRow() - 1).getValues();
  var index = channelNames.findIndex(channelName => {return channelName == channel});
  var indexRow = index + 3;

  var channelSheet = spreadsheet.getSheetByName(channel);

  Logger.log("Channel: " + channel);

  if (channel != "Low Quality RipsTM")
    addNewVideos();

  var row = parseInt(indexSheet.getRange(indexRow, 2).getValue().replace(/.*row/g, ""));

  do
  {
    if (row >= channelSheet.getLastRow())
      row = 2;
    else
      row++;

    checkVideoStatus(row);
    checkDescTitleStatus(row);

    updateCount++;
    var currentTime = new Date();
    var formattedTime = formatDate(currentTime).replace("   ", " ");

    indexSheet.getRange(indexRow, 2).setValue("Last updated " + formattedTime + " UTC on row " + row + ".");
  }
  while (updateCount < 42 && currentTime.getTime() - startTime.getTime() < 240000)

  if (errorLog.length > 0)
  {
    // Send an email notifying of any changes or errors.
    var emailAddress = "a.k.zamboni@gmail.com";
    var subject = "SiIvaGunner Bootlegs Changelog Update";
    var message = "There are " + errorLog.length + " new changes.\n\n" + errorLog.join("\n\n").replace(/NEWLINE/g, "\n");

    MailApp.sendEmail(emailAddress, subject, message);
    Logger.log("Email successfully sent.\n" + message);

    // Update the changelog spreadsheet with any new changes.
    //Logger.log(changelog);
    var changelogSpreadsheet = SpreadsheetApp.openById("1pN9O24zfrDBl6WNySj4yurFiqT3UmQd1IdRISvUjHd8");

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
                                          channelSheet.getRange(lastRow, titleCol).setValue(title);
                                          channelSheet.getRange(lastRow, videoStatusCol).setValue("Public");
                                          channelSheet.getRange(lastRow, videoUploadDateCol).setValue(uploadDate);
                                          channelSheet.getRange(lastRow, videoLengthCol).setValue(length);
                                          channelSheet.getRange(lastRow, videoDescriptionCol).setValue(description);
                                          channelSheet.getRange(lastRow, videoViewsCol).setValue(viewCount);
                                          channelSheet.getRange(lastRow, videoLikesCol).setValue(likeCount);
                                          channelSheet.getRange(lastRow, videoDislikesCol).setValue(dislikeCount);
                                          channelSheet.getRange(lastRow, videoCommentsCol).setValue(commentCount);

                                          Logger.log("Row " + lastRow + ": " + title + " - " + uploadDate);
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

    Logger.log("New rips: " + newVideoCount);
    channelSheet.getDataRange().sort({column: videoUploadDateCol, ascending: false});
  }

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

    if (responseText.indexOf('"isUnlisted":true') != -1)
    {
      if (currentStatus != "Unlisted")
        newStatus = "Unlisted";
    }
    else if (responseText.indexOf('"status":"OK"') != -1)
    {
      //errorLog.push(title + " video status public. [" + videoId + "]\n" + responseText);
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
    else
    {
      Logger.log(title + " video status not found.");
      //errorLog.push(title + " video status not found. [" + videoId + "]\n" + responseText);
    }

    Logger.log("Row " + row + ": " + title + " (" + newStatus + ")");

    if (newStatus != "Unchanged")
    {
      channelSheet.getRange(row, videoStatusCol).setValue(newStatus);
      errorLog.push(title + " was changed from " + currentStatus + " to " + newStatus + ".");
      changelog.push(["Statuses", formatYouTubeHyperlink(videoId), title, currentStatus, newStatus]);
    }
  }

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
        var videoResponse = YouTube.Videos.list('snippet,statistics,contentDetails', {id: videoId, maxResults: 1, type: 'video'});

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

                                      var uploadDate = formatDate(item.snippet.publishedAt);
                                      var length = item.contentDetails.duration.toString();

                                      channelSheet.getRange(row, videoUploadDateCol).setValue(uploadDate);
                                      channelSheet.getRange(row, videoLengthCol).setValue(length);
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
        var url = "[" + videoTitle + "]";
        channelSheet.getRange(row, titleCol).setValue(videoTitle);
        errorLog.push(url + "\nOLD TITLE:\n" + sheetTitle + "\nNEW TITLE:\n" + videoTitle);
        changelog.push(["Titles", formatYouTubeHyperlink(videoId), sheetTitle, videoTitle]);
      }

      if (sheetDescription != videoDescription && videoDescription != null)
      {
        change = true;
        var url = "[" + videoTitle + "]";
        channelSheet.getRange(row, videoDescriptionCol).setValue(videoDescription);
        errorLog.push(url + "\nOLD DESCRIPTION:\n" + sheetDescription + "\nNEW DESCRIPTION:\n" + videoDescription);
        changelog.push(["Descriptions", formatYouTubeHyperlink(videoId), videoTitle, sheetDescription.replace(/NEWLINE/g, "\n"), videoDescription.replace(/NEWLINE/g, "\n")]);
      }
    }
    Logger.log("Row " + row + ": " + sheetTitle + " (desc/title change " + change + ")");
  }
}
