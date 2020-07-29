var appUrl = "https://script.google.com/macros/s/AKfycbzm47208rTvNpu2pa-vhqdT53k9_F1l0j47nqlJOw/exec";
var lastSelection = "single";

document.onkeydown = checkKey;

if (document.location.pathname.match("generator.php"))
{
  document.onclick = checkSelection;
  window.onload = load;
}

function load()
{
  var str = "{{Rip" +
            "\n|image= Fire Emblem.jpg" +
            "\n" +
            "\n|link= NzoneDE0A2o" +
            "\n|playlist= Fire Emblem" +
            "\n|playlist id= PLL0CQjrcN8D1CYB8alWM5bax6yGk83dZ8" +
            "\n|upload= April 7, 2018" +
            "\n|length= 3:25" +
            "\n|author= " +
            "\n" +
            "\n|album= " +
            "\n|track= " +
            "\n" +
            "\n|music= The Inn" +
            "\n|composer= Yuka Tsujiyoko" +
            "\n|platform= Game Boy Advance" +
            "\n|catchphrase= Go-Go Gadget Channel Description!" +
            "\n}}" +
            "\n\"'''The Inn - Fire Emblem'''\" is a high quality rip of \"The Inn\" from ''Fire Emblem''." +
             "\n== Jokes ==";

  document.getElementById("template").rows = 21;
  document.getElementById("template").innerHTML = str;
}

function checkKey(e)
{
  if (e.code == "Enter" && document.getElementById("inputText").value != "")
    document.getElementById("submitBtn").click();
}

function checkSelection()
{
  var selection = document.getElementById("format").value;

  if (selection != lastSelection)
  {
    var template = document.getElementById("template").value;
    template = template.toString().replace("== Jokes ==", "JOKEHEADER");
    lastSelection = selection;

    if (selection == "none")
      template = template.replace(/\t\t= |\t= | = |= /g, "=");
    else if (selection == "single")
      template = template.replace(/\t\t= |\t= | = |=/g, "= ");
    else if (selection == "double")
      template = template.replace(/\t\t= |\t= |= |=/g, " = ");
    else if (selection == "tab")
    {
      template = template.replace(/ = |= |=/g, "\t\t= ");
      template = template.replace("playlist\t\t", "playlist\t");
      template = template.replace("playlist id\t\t", "playlist id\t");
      template = template.replace("composer\t\t", "composer\t");
      template = template.replace("composer label\t\t", "composer label\t");
      template = template.replace("platform\t\t", "platform\t");
      template = template.replace("platform label\t\t", "platform label\t");
      template = template.replace("catchphrase\t\t", "catchphrase\t");
    }

    template = template.replace("JOKEHEADER", "== Jokes ==");
    document.getElementById("template").innerHTML = template;
  }
}

function searchSheet()
{
  var input = document.getElementById("inputText").value.trim();

  if (input.length != 11 && input.indexOf(" ") == -1)
    input = input.replace("{\"\":\"", "").replace("\"}", "").replace("&feature=youtu.be", "").replace(/&.*/, "").replace(/h.*=/, "");

  if (input.length == 0)
    document.getElementById("loadStatus").innerHTML = "Please enter a video title, URL, or ID. For example: \"The Inn - Fire Emblem\"";
  else
  {
    var url = appUrl + "?type=search&input=" + input;
    getUrlResponse(url, "search");
  }
}

function copyTemplate()
{
  var copyText = document.getElementById("template");

  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  document.execCommand("copy");
}

function generateTemplate()
{
  var format = document.getElementById("format").value;
  var input = document.getElementById("inputText").value.trim();

  if (input.length == 0)
  {
    document.getElementById("template").rows = 1;
    document.getElementById("template").innerHTML = "Please enter a video URL or ID. For example: \"NzoneDE0A2o\"";
    document.getElementById("thumbnail").innerHTML = "";
  }
  else
  {
    var id = input.replace("{\"\":\"", "").replace("\"}", "").replace("&feature=youtu.be", "").replace(/&.*/, "").replace(/h.*=/, "");

    if (id.length != 11)
    {
      document.getElementById("template").rows = 1;
      document.getElementById("template").innerHTML = "Invalid video URL or ID: \"" + input + "\"";
      document.getElementById("thumbnail").innerHTML = "";
    }
    else
    {
      var url = appUrl + "?type=template&format=" + format + "&id=" + id;
      getUrlResponse(url, "template");
    }
  }
}

function reportIssue()
{
  var page = document.getElementById("page").value;
  var id = document.getElementById("id").value.trim();
  var desc = document.getElementById("desc").value.trim();

  if (id.length == 0)
    document.getElementById("loadStatus").innerHTML = "Please enter the title, URL, or ID that caused the problem.";
  else
  {
    var url = appUrl + "?type=report&page=" + page  + "&id=" + id + "&desc=" + desc;
    getUrlResponse(url, "report");
  }
}

function getUrlResponse(url, type)
{
  document.getElementById("loadStatus").innerHTML = "Loading...";

  if (window.XMLHttpRequest)
    var xhttp = new XMLHttpRequest(); // For modern browsers
  else
    var xhttp = new ActiveXObject("Microsoft.XMLHTTP"); // For IE5 and IE6

  xhttp.open("GET", url, true);
  xhttp.send();
  xhttp.onreadystatechange = function()
  {
    if (this.readyState == 4 && this.status == 200)
    {
      var response = this.responseText;

      if (type == "search")
      {
        if (response.indexOf("SEPARATOR") != -1)
        {
          response = response.replace(/\n/g, "<br/>").split("SEPARATOR");
          document.getElementById("videoEmbed").src = "https://www.youtube.com/embed/" + response[0];
          document.getElementById("videoInfo").innerHTML = response[1];
          document.getElementById("videoDesc").innerHTML = response[2];
        }
        else
          alert(response);
      }
      else if (type == "template")
      {
        var id = url.split("id=").pop();
        var lineCount = response.split(/\n/).length + 1;

        document.getElementById("template").rows = lineCount;
        document.getElementById("template").innerHTML = response;

        if (response.indexOf("\n") != -1)
        {
          var thumbnailLink = "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg";
          document.getElementById("thumbnail").innerHTML = "<a target=\"_blank\" href=\"" + thumbnailLink + "\"><img src=\"" + thumbnailLink + "\" alt=\"Thumbnail\"></a>";
        }
      }
      else if (type == "report")
        document.getElementById("loadStatus").innerHTML = response;

      if (type != "report")
        document.getElementById("loadStatus").innerHTML = "";
    }
  }
}
