var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

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

function doGet(e)
{
  if (e.parameters.type.toString() == "search")
    return ContentService.createTextOutput(searchSheet(e.parameters.input.toString()));
  else if (e.parameters.type.toString() == "template")
    return ContentService.createTextOutput(generateTemplate(e.parameters.id.toString(), e.parameters.format.toString()));
  else if (e.parameters.type.toString() == "report")
    return ContentService.createTextOutput(reportIssue(e.parameters.page.toString(), e.parameters.email.toString(), e.parameters.desc.toString()));
}

function formatDate(date, style)
{
  if (typeof date == "string")
    date = date.replace("T", "   ").replace("Z", "").replace(".000Z", "");
  else
    date = Utilities.formatDate(date, "UTC", "yyyy-MM-dd   HH:mm:ss");

  return date;
}

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

function formatYouTubeHyperlink(str)
{
  str = '=HYPERLINK("https://www.youtube.com/watch?v=' + str + '", "' + str + '")';
  return str;
}

function formatWikiHyperlink(str, wikiUrl)
{
  if (wikiUrl == null)
    wikiUrl = "https://siivagunner.fandom.com/wiki/";

  str = str.replace(/Reupload: /g, "").replace(/Reup: /g, "");
  var simpleStr = str.replace(/"/g, '""').replace(/ \(GiIvaSunner\)/g, "");

  str = '=HYPERLINK("' + wikiUrl + formatWikiLink(str) + '", "' + simpleStr + '")';
  return str;
}

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
