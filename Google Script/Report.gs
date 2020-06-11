function fileReport(page, id, desc)
{
  var date = new Date();

  var reportsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reports");
  var row = reportsSheet.getRange("G1").getValue() + 2;

  try
  {
    reportsSheet.getRange(row, 1).setValue(date);
    reportsSheet.getRange(row, 2).setValue(page);
    reportsSheet.getRange(row, 3).setValue(id);
    reportsSheet.getRange(row, 4).setValue(desc);

    return "Your response has been recorded.";
  } catch (e) { return e; }
}
