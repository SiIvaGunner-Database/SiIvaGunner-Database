<!doctype html>
<html>
  <head>
    <title>SiIvaGunner Database</title>
    <link rel="shortcut icon" type="image/png" href="images/favicon.png"/>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="script.js"></script>
  </head>
  <body>
    <?php include("nav.html"); ?>
    <div id="main">
      <div>
        <label>What page did you encounter a problem on?</label>
        <br />
        <select id = "page">
          <option value = "database">Database Search</option>
          <option value = "generator">Template Generator</option>
        </select>
      </div>
      <br />
      <div>
        <label>What is the URL or ID that caused the problem?</label>
        <br />
        <input type = "text" id = "id" placeholder = "URL or ID" required/>
      </div>
      <br />
      <div>
        <label>Please describe the problem you encountered.</label>
        <textarea id = "desc" rows = 10></textarea>
      </div>
      <input type = "button" id = "submitBtn" onclick = "fileReport()" value = "Submit">
      <p id = "response"></p>
    </div>
    <?php include("footer.html"); ?>
  </body>
</html>
