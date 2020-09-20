<!doctype html>
<html>
  <?php include("head.php"); ?>
  <body>
    <?php include("nav.html"); ?>
    <main>
      <p class="box">
        For a list of every SiIvaGunner, TimmyTurnersGrandDad, and VvvvvaVvvvvvr video, see this <a target="_blank" href="https://docs.google.com/spreadsheets/d/1B7b9jEaWiqZI8Z8CzvFN1cBvLVYwjb5xzhWtrgs4anI/edit?usp=sharing">spreadsheet</a>.<br/>
        Note that the title or video ID searched for must be exact. This is not yet an actual database.
      </p>
      <div id="searchContainer">
        <input type="text" id="inputText" class="searchBox" placeholder="Search by title, URL, or ID"/>
        <button id="submitBtn" class="searchBtn" onclick="searchSheet()"></button>
      </div>
      <span id="loadStatus"></span>
      <br/>
      <div id="video">
        <iframe id="videoEmbed" width="560px" height="315px" src="https://www.youtube.com/embed/NzoneDE0A2o" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <div id="videoInfo" class="box">
        Archive link: <a target="_blank" href="https://web.archive.org/web/*/https://www.youtube.com/watch?v=NzoneDE0A2o">Wayback Machine</a><br/>
        Upload date: 2018-04-07 08:00:02<br/>
        Video length: 3:25<br/>
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
