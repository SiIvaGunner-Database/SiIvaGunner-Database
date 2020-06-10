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
      <input type="text" id="inputText" placeholder="Enter URL or ID"/>
      <button id="submitBtn" onclick="generateTemplate()">Submit</button>
      <button onclick="copyTemplate()">Copy</button>
      <br/>
      Preferred formatting:
      <select id="format">
        <option value="single">One-sided spacing</option>
        <option value="double">Double-sided spacing</option>
        <option value="tab">Tabbed spacing</option>
        <option value="none">No spacing</option>
      </select>
      <textarea readonly id="template"></textarea>
      <div id="thumbnail"><img src="https://img.youtube.com/vi/NzoneDE0A2o/maxresdefault.jpg" alt="Thumbnail"></div>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
