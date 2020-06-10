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
        <input type="text" id="inputText" class="searchBox" placeholder="Search by title, URL, or ID"/>
        <button id="submitBtn" class="searchBtn" onclick="search()"></button>
      </div>
      <br/>
      <div id="video">
        <iframe id="videoEmbed" width="560px" height="315px" src="https://www.youtube.com/embed/NzoneDE0A2o" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <div id="videoInfo">
        Video status: public<br/>
        Wiki status: documented
      </div>
      <div id="videoDesc">
        Music: The Inn<br/>
        Composer: Yuka Tsujiyoko<br/>
        Playlist: https://www.youtube.com/playlist?list=PLL0CQjrcN8D1CYB8alWM5bax6yGk83dZ8<br/>
        Platform: Game Boy Advance<br/><br/>

        Go-Go Gadget Channel Description!
      </div>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
