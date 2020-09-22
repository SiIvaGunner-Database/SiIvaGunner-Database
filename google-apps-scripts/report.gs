function reportIssue(page, email, desc)
{
  try
  {
    var date = new Date();
    var reportsSheet = SpreadsheetApp.openById("1MYZFZyRzmKjyDzC9vOArkoTfXIc5aQmYcErAI4gE1bA").getSheetByName("Reports");
    var lastRow = reportsSheet.getLastRow();

    if (lastRow != 1)
      reportsSheet.insertRowAfter(lastRow);

    lastRow++;

    reportsSheet.getRange(lastRow, 1).setValue(date);
    reportsSheet.getRange(lastRow, 2).setValue(page);
    reportsSheet.getRange(lastRow, 3).setValue(email);
    reportsSheet.getRange(lastRow, 4).setValue(desc);

    var emailAddress = "a.k.zamboni@gmail.com";
    var subject = "New Report";
    var message = "Date: " + date + "\nPage: " + page + "\nEmail: " + email + "\nProblem: " + desc;

    MailApp.sendEmail(emailAddress, subject, message);

    return "Your response has been recorded.";
  }
  catch (e)
  {
    return e;
  }
}
