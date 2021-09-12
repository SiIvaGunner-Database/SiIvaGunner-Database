var lastSelection = "single"; // Default spacing format for rip templates

document.onkeydown = checkKey;

if (document.location.pathname.match("generate"))
  document.onclick = checkSelection;



// Check for enter key presses
function checkKey(e) {
  if (e.code == "Enter" && document.getElementById("inputText") && document.getElementById("inputText").value != "")
    document.getElementById("submitBtn").click();
}




// Format spacing in the rip template
function checkSelection() {
  var selection = document.getElementById("format").value;

  if (selection != lastSelection) {
    var template = document.getElementById("template").value;
    template = template.toString().replace("== Jokes ==", "JOKEHEADER");
    lastSelection = selection;

    if (selection == "none")
      template = template.replace(/\t\t\t= |\t\t= |\t= | = |= /g, "=");
    else if (selection == "single")
      template = template.replace(/\t\t\t= |\t\t= |\t= | = |=/g, "= ");
    else if (selection == "double")
      template = template.replace(/\t\t\t= |\t\t= |\t= |= |=/g, " = ");
    else if (selection == "tab") {
      template = template.replace(/ = |= |=/g, "\t\t\t= ");
      template = template.replace("playlist\t\t", "playlist\t");
      template = template.replace("playlist id\t\t\t", "playlist id\t");
      template = template.replace("composer\t\t", "composer\t");
      template = template.replace("composer label\t\t\t", "composer label\t");
      template = template.replace("platform\t\t", "platform\t");
      template = template.replace("platform label\t\t\t", "platform label\t");
      template = template.replace("catchphrase\t\t\t", "catchphrase\t");
    }

    template = template.replace("JOKEHEADER", "== Jokes ==");
    document.getElementById("template").innerHTML = template;
  }
}



// Copy rip template text to clipboard
function copyTemplate() {
  var copyText = document.getElementById("template");

  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  document.execCommand("copy");
}



// Generate a rip template for use with wiki articles
function generateTemplate() {
  var format = document.getElementById("format").value;
  var input = document.getElementById("inputText").value.trim();

  if (input.length == 0) {
    document.getElementById("template").rows = 1;
    document.getElementById("template").innerHTML = "Please enter a video URL or ID. For example: \"NzoneDE0A2o\"";
    document.getElementById("thumbnail").innerHTML = "";
  }
  else {
    var id = input.replace(/&.*/g, "").replace(/.*[=\/]/g, "");

    if (id.length != 11) {
      document.getElementById("template").rows = 1;
      document.getElementById("template").innerHTML = "Invalid video URL or ID: \"" + input + "\"";
      document.getElementById("thumbnail").innerHTML = "";
    }
    else {
      var url = "https://youtube.googleapis.com/youtube/v3/videos?";
      var params = {
        part: "id,snippet,contentDetails",
        id: id,
        key: "AIzaSyDVXqIQbfzMant00SVbsajmuXZlLy-Ezfw",
      };

      Object.keys(params).forEach(function(key) {url += "&" + key + "=" + params[key];});

      var urlRequest = requestUrl(url);

      urlRequest.onreadystatechange = function() {
        if (urlRequest.readyState == 4 && urlRequest.status == 200) {
          var videoJSON = JSON.parse(urlRequest.responseText).items[0];

          if (!videoJSON) {
            document.getElementById("template").rows = 1;
            document.getElementById("template").innerHTML = 'No video found with the ID "' + id + '"';
            document.getElementById("thumbnail").innerHTML = "";
            return;
          }

          var pageName = videoJSON.snippet.title.toString();
          var description = videoJSON.snippet.description.toString().replace(/\r/g, "").replace(/  /g, "&nbsp;&nbsp;");
          var uploadDate = videoJSON.snippet.publishedAt.toString();
          var length = videoJSON.contentDetails.duration.toString();
          var channelId = videoJSON.snippet.channelId.toString();

          var siivaId = "UC9ecwl3FTG66jIKA9JRDtmg";
          var ttgdId = "UCIXM2qZRG9o4AFmEsKZUIvQ";
          var mysiktId = "UCnv4xkWtbqAKMj8TItM6kOA";
          var vavrId = "UCCPGE1kAoonfPsbieW41ZZA";
          var vavrDescription = description.replace(/\n/g, "<br/>\n");

          var playlistId = "";
          var mix = "";
          var track = "";
          var simplifiedTrack = "";
          var developer = "";
          var composer = "";
          var composerLabel = "";
          var platform = "";
          var platformLabel = "";
          var ripper = "";
          var catchphrase = "";
          var game = "";

          // Add labels if needed
          if (description.includes("Composers: ")) {
            description = description.replace("Composers: ", "Composer: ");
            composerLabel = "\n|composer label\t= Composers";
          }
          else if (description.includes("Composer(s): ")) {
            description = description.replace("Composer(s): ", "Composer: ");
            composerLabel = "\n|composer label\t= Composer(s)";
          }
          else if (description.includes("Arrangement: ")) {
            description = description.replace("Arrangement: ", "Composer: ");
            composerLabel = "\n|composer label\t= Arrangement";
          }
          else if (description.includes("Arrangers: ")) {
            description = description.replace("Arrangers: ", "Composer: ");
            composerLabel = "\n|composer label\t= Arrangers";
          }
          else if (description.includes("Composed by: ")) {
            description = description.replace("Composed by: ", "Composer: ");
            composerLabel = "\n|composer label\t= Composed by";
          }

          if (description.includes("Platforms: ")) {
            description = description.replace("Platforms: ", "Platform: ");
            platformLabel = "\n|platform label\t= Platforms";
          }
          else if (description.includes("Available on: ")) {
            description = description.replace("Available on: ", "Platform: ");
            platformLabel = "\n|platform label\t= Available on";
          }

          if (description.includes("Ripped by: ")) {
            description = description.replace("Ripped by: ", "Ripper: ");
          }

          // Use regular expressions to get the necessary information from the description
          var playlistIdPattern = new RegExp("Playlist: (.*)\n");
          var composerPattern = new RegExp("Composer: (.*)\n");
          var developerPattern = new RegExp("Developed by: (.*)\n");
          var platformPattern = new RegExp("Platform: (.*)\n");

          if (description.includes("\n\n"))
            var ripperPattern = new RegExp("Ripper: (.*)\n");
          else {
            var ripperPattern = new RegExp("Ripper: (.*)");
            catchphrase = "\n|catchphrase\t= ";
          }

          description = description.replace(/,/g, "COMMA");

          if (description.includes("Playlist: "))
            playlistId = playlistIdPattern.exec(description).toString().split(",").pop();

          if (description.includes("Ripper: "))
            ripper = ripperPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

          if (description.includes("Developed by: "))
            developer = developerPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

          if (description.includes("Composer: "))
            composer = "\n|composer\t= " + composerPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

          if (description.includes("Platform: "))
            platform = "\n|platform\t= " + platformPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",");

          if (!description.includes("Please read the channel description.") && description.match(/(\n\n|═\n)/))
            catchphrase = "\n|catchphrase\t= " + description.split(/(\n\n|═\n)/).pop().replace(/COMMA/g, ",");

          for (var i = 0; i < length.length; i++) {
            if (length.charAt(i) == "T" && length.charAt(i + 2) == "S")
              length = length.replace("PT", "0:0");
            else if (length.charAt(i) == "T" && length.charAt(i + 3) == "S")
              length = length.replace("PT", "0:");
            else if (length.charAt(i) == "M" && length.charAt(i + 2) == "S")
              length = length.replace("M", ":0");
            if (length.charAt(i) == "H" && length.charAt(i + 2) == "M")
              length = length.replace("H", ":0");
          }

          if (!length.includes("S"))
            length += "00";

          length = length.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "");

          // Format the upload date
          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          uploadDate = new Date(uploadDate); // "MMMM d, yyyy"
          uploadDate = months[uploadDate.getUTCMonth()] + " " + uploadDate.getUTCDate() + ", " + uploadDate.getUTCFullYear();

          // Seperate the rip title into four parts: full title, song title, game title, and mix
          var gameSeperatorChar = "-";
          var versionSeperatorChar = "(";

          if (channelId == mysiktId) {
            if (pageName.includes("~")) {
              versionSeperatorChar = "~";
            }

            if (pageName.includes("|")) {
              gameSeperatorChar = "|";
            }
          }

          var titleSections = pageName.split(gameSeperatorChar);

          if (titleSections.length > 1) {
            game = titleSections.pop().trim();
            track = titleSections.join(gameSeperatorChar).trim();
          }
          else {
            game = pageName;
            track = pageName;
          }

          if (channelId == mysiktId) {
            if (description.match(game + ": (.*)\n")) {
              playlistIdPattern = new RegExp(game + ": (.*)\n");
              playlistId = playlistIdPattern.exec(description).toString().split(",").pop();
            }

            game = game.replace(/ Music$/, "");
          }

          simplifiedTrack = track;

          if (track.includes(versionSeperatorChar) && (track.includes("Mix") || track.includes("Version"))) {
            var trackSections = track.split(versionSeperatorChar);
            mix = "of the " + trackSections.pop().replace(/\)/g, "").replace(/Mix/g, "mix").replace(/Version/g, "version").trim() + " ";
            simplifiedTrack = trackSections.join(versionSeperatorChar).trim();
          }

          // Build the template
          var template = "";

          if (pageName.includes("|")) {
            template += "{{DISPLAYTITLE:" + pageName.replace(/\|/g, "{{!}}") + "}}\n"
          }

          template += "{{Rip" +
                      "\n|image\t\t= " + game + ".jpg" +
                      "\n" +
                      "\n|link\t\t= " + id;

          if (channelId != vavrId) {
            template += "\n|playlist\t= " + game +
                        "\n|playlist id\t= " + playlistId.replace(/h.*=/, "");
          }

          template += "\n|upload\t\t= " + uploadDate +
                      "\n|length\t\t= " + length +
                      "\n|author\t\t= " + ripper;

          if (channelId != vavrId) {
            template += "\n";

            if (channelId == siivaId || channelId == ttgdId) {
              template += "\n|album\t\t= " +
                          "\n|track\t\t= " +
                          "\n";
            }

            if (channelId != mysiktId) {
              template += "\n|music\t\t= " + track;
            }

            template += /* "\n|composer\t= " + */ composer +
                        /* "\n|composer label\t= " + */ composerLabel;

            if (channelId == mysiktId) {
              template += "\n|developer\t\t= " + developer;
            }

            template += /* "\n|platform\t= " + */ platform +
                        /* "\n|platform label\t= " + */ platformLabel +
                        /* "\n|catchphrase\t= " + */ catchphrase +
                        "\n}}" +
                        "\n\"'''" + pageName + "'''\" is a high quality rip " + mix +
                        "of \"" + simplifiedTrack + "\" from ''" + game + "''." +
                        "\n== Jokes ==";
          }
          else {
            template += "\n|all_authors_if_multiple= " +
                        "\n" +
                        "\n|track\t\t= " +
                        "\n|previous\t\t= " +
                        "\n|next\t\t= " +
                        "\n|description\t= " + vavrDescription +
                        "\n}}" +
                        "\n\"'''{{PAGENAME}}'''\" is a super duper epic medium-high quality vip " + mix +
                        "of \"" + simplifiedTrack + "\" from ''" + game + "''." +
                        "\n== Jokes ==";
          }

          if (format == "single")
            template = template.replace(/\t\t= |\t= /g, "= ");
          else if (format == "double")
            template = template.replace(/\t\t= |\t= /g, " = ");
          else if (format == "none")
            template = template.replace(/\t\t= |\t= /g, "=");

          var lineCount = template.split(/\n/).length + 1;
          var thumbnailLink = "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg";
          var thumbnailElement = "<a target=\"_blank\" href=\"" + thumbnailLink + "\"><img src=\"" + thumbnailLink + "\" alt=\"Thumbnail\"></a>";

          document.getElementById("template").rows = lineCount;
          document.getElementById("template").innerHTML = template;
          document.getElementById("thumbnail").innerHTML = thumbnailElement;
        }
      }
    }
  }
}



// Send a URL get request
function requestUrl(url) {
  if (window.XMLHttpRequest)
    var request = new XMLHttpRequest(); // For modern browsers
  else
    var request = new ActiveXObject("Microsoft.XMLHTTP"); // For IE5 and IE6

  request.open("GET", url, true);
  request.send();
  return request;
}
