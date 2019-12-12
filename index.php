<!doctype html>
<html>
  <head>
    <title>SiIvaGunner Database</title>
    <link rel="shortcut icon" type="image/png" href="gadget.png"/>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="script.js"></script>
  </head>
  <body>
    <?php include("nav.html"); ?>
    <div id="main">
      <div id="database">
        <form>
          <input type = "text" id = "textBox" placeholder="Search database"/>
          <input type = "button" id = "submitBtn" onClick="formSubmit()" value = "Submit"/>
        </form>
      </div>
    </div>
    <?php include("footer.html"); ?>
  </body>
</html>
