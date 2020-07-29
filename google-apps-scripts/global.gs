var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e)
{
  if (e.parameters.type.toString() == "search")
    return ContentService.createTextOutput(searchSheet(e.parameters.input.toString()));
  else if (e.parameters.type.toString() == "template")
    return ContentService.createTextOutput(generateTemplate(e.parameters.id.toString(), e.parameters.format.toString()));
  else if (e.parameters.type.toString() == "report")
    return ContentService.createTextOutput(reportIssue(e.parameters.page.toString(), e.parameters.id.toString(), e.parameters.desc.toString()));
}

function formatWikiLink(str)
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
