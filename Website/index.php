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
      <div id="searchContainer">
        <input type="text" id="inputText" class="textBox" placeholder="Search by video title or ID"/>
        <button id="submitBtn" class="searchBtn" onclick="search()"></button>
      </div>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
