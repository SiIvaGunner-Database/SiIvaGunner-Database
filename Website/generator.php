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
      <input type = "text" id = "textBox" placeholder = "Video ID"/>
      <input type = "button" id = "submitBtn" onclick = "generateTemplate()" value = "Submit">
      <button onclick = "copyTemplate()">Copy</button>
      <textarea readonly id = "template"></textarea>
      <div id = "thumbnail"></div>
    </div>
    <?php include("footer.html"); ?>
  </body>
</html>
