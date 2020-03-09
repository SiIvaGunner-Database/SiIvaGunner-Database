function fileReport(page, id, desc) {
  var date = new Date();

  var timestamp = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = timestamp.getRange("G1").getValue() + 2;

  try
  {
  timestamp.getRange(row, 1).setValue(date);
  timestamp.getRange(row, 2).setValue(page);
  timestamp.getRange(row, 3).setValue(id);
  timestamp.getRange(row, 4).setValue(desc);

    return "Your response has been recorded.";
  }
  catch (e) { return e; }
}
