<!doctype html>
<html>
  <?php include("head.php"); ?>
  <body>
    <?php include("nav.html"); ?>
    <main>
      <input type="text" id="inputText" placeholder="Enter URL or ID"/>
      <button id="submitBtn" onclick="generateTemplate()">Submit</button>
      <button onclick="copyTemplate()">Copy</button>
      <span id="loadStatus"></span>
      <br/>
      Preferred formatting:
      <select id="format">
        <option value="single">One-sided spacing</option>
        <option value="double">Double-sided spacing</option>
        <option value="tab">Tabbed spacing</option>
        <option value="none">No spacing</option>
      </select>
      <textarea readonly id="template"></textarea>
      <div id="thumbnail">
        <a target="_blank" href="https://img.youtube.com/vi/NzoneDE0A2o/maxresdefault.jpg">
          <img src="https://img.youtube.com/vi/NzoneDE0A2o/maxresdefault.jpg" alt="Thumbnail">
        </a>
      </div>
    </main>
    <?php include("footer.html"); ?>
  </body>
</html>
