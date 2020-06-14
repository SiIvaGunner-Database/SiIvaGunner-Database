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
      <p class="box">
        Currently, only SiIvaGunner videos have been added to the <a target="_blank" href="https://docs.google.com/spreadsheets/d/1B7b9jEaWiqZI8Z8CzvFN1cBvLVYwjb5xzhWtrgs4anI/edit?usp=sharing">spreadsheet</a> keeping track of rips.<br/>
        TimmyTurnersGrandDad and VvvvvaVvvvvvr videos will added in the future.<br/>
        Note that the title searched for must be exact.
      </p>
      <div id="searchContainer">
        <input type="text" id="inputText" class="searchBox" placeholder="Search by title, URL, or ID"/>
        <button id="submitBtn" class="searchBtn" onclick="search()"></button>
      </div>
      <br/>
      <div id="video">
        <iframe id="videoEmbed" width="560px" height="315px" src="https://www.youtube.com/embed/NzoneDE0A2o" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <div id="videoInfo" class="box">
        Archive link: <a target="_blank" href="https://web.archive.org/web/*/https://www.youtube.com/watch?v=NzoneDE0A2o">Wayback Machine</a><br/>
        Upload date: 2018-04-07T08:00:02Z<br/>
        Video length: PT3M25S<br/>
        Video status: public<br/>
        Wiki status: <a target="_blank" href="https://siivagunner.fandom.com/wiki/The%20Inn%20-%20Fire%20Emblem">documented</a>
      </div>
      <div id="videoDesc">
        Music: The Inn<br/>
        Composer: Yuka Tsujiyoko<br/>
        Playlist: https://www.youtube.com/playlist?list=PLL0CQjrcN8D1CYB8alWM5bax6yGk83dZ8<br/>
        Platform: Game Boy Advance<br/>
        <br/>
        Go-Go Gadget Channel Description!
      </div>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
