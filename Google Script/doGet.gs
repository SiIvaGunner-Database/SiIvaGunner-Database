function doGet(e)
{
  if (e.parameters.type.toString() == "search")
    return ContentService.createTextOutput(search(e.parameters.input.toString()));
  else if (e.parameters.type.toString() == "template")
    return ContentService.createTextOutput(buildTemplate(e.parameters.id.toString(), e.parameters.format.toString()));
  else if (e.parameters.type.toString() == "report")
    return ContentService.createTextOutput(fileReport(e.parameters.page.toString(), e.parameters.id.toString(), e.parameters.desc.toString()));
}
