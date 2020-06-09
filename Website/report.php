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
    <main>
      <div>
        <label>What page did you encounter a problem on?</label>
        <br/>
        <select id="page">
          <option value="database">Database Search</option>
          <option value="generator">Template Generator</option>
        </select>
      </div>
      <br/>
      <div>
        <label>What did you enter when the problem occurred?</label>
        <br/>
        <input type="text" id="id" placeholder="Enter title, URL, or ID" required/>
      </div>
      <br/>
      <div>
        <label>Optionally, please describe the problem you encountered.</label>
        <textarea id="desc" rows=10></textarea>
      </div>
      <button onclick="report()">Submit</button>
      <p id="response"></p>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
