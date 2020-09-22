<!doctype html>
<html>
  <?php include("head.php"); ?>
  <body>
    <?php include("nav.html"); ?>
    <main>
      <div>
        <label>Where did you encounter a problem?</label>
        <br/>
        <select id="page">
          <option value="spreadsheet">Database Spreadsheet</option>
          <option value="search">Database Search</option>
          <option value="generator">Template Generator</option>
        </select>
      </div>
      <br/>
      <div>
        <label>If you want a response, please enter an email address.</label>
        <br/>
        <input type="email" id="email" placeholder="Enter email address"/>
      </div>
      <br/>
      <div>
        <label>Please describe the problem you encountered.</label>
        <textarea id="desc" rows=10  placeholder="Enter any relevant information"></textarea>
      </div>
      <button onclick="reportIssue()">Submit</button>
      <p id="loadStatus"></p>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
