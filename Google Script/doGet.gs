function doGet(e)
{
  if (e.parameters.type.toString() == "generator")
    return ContentService.createTextOutput(buildTemplate(e.parameters.id.toString()));
  else if (e.parameters.type.toString() == "report")
    return ContentService.createTextOutput(fileReport(e.parameters.page.toString(), e.parameters.id.toString(), e.parameters.desc.toString()));
}

function test()
{
  var id = "aVaxy1iLCVQ";
  var val = buildTemplate(id);
  Logger.log(val);
}
