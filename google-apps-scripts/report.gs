function reportIssue(page, id, desc)
{
  try
  {
    var date = new Date();
    var reportsSheet = SpreadsheetApp.openById("1MYZFZyRzmKjyDzC9vOArkoTfXIc5aQmYcErAI4gE1bA").getSheetByName("Reports");
    if (reportsSheet.getLastRow() != 1) reportsSheet.insertRowAfter(reportsSheet.getLastRow());
    var row = reportsSheet.getLastRow() + 1;

    reportsSheet.getRange(row, 1).setValue(date);
    reportsSheet.getRange(row, 2).setValue(page);
    reportsSheet.getRange(row, 3).setValue(id);
    reportsSheet.getRange(row, 4).setValue(desc);

    var emailAddress = "a.k.zamboni@gmail.com";
    var subject = "New Report";
    var message = "Date:       " + date + "\nPage:      " + page + "\nInput:      " + id + "\nProblem: " + desc;

    MailApp.sendEmail(emailAddress, subject, message);

    return "Your response has been recorded.";
  }
  catch (e)
  {
    return e;
  }
}
