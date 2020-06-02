var appUrl = "https://script.google.com/macros/s/AKfycbzm47208rTvNpu2pa-vhqdT53k9_F1l0j47nqlJOw/exec";

function generateTemplate()
{
  var id = document.getElementById("textBox").value;
  id = id.replace("{\"\":\"", "").replace("\"}", "").replace("&feature=youtu.be", "").replace(/&.*/, "").replace(/h.*=/, "");
  var url = appUrl + "?type=generator&id=" + id;
  var xhttp;

  if (window.XMLHttpRequest)
    xhttp = new XMLHttpRequest(); // For modern browsers
  else
    xhttp = new ActiveXObject("Microsoft.XMLHTTP"); // For IE5 and IE6

  xhttp.onreadystatechange = function()
  {
    if (this.readyState == 4 && this.status == 200)
    {
      var lineCount = this.responseText.split(/\n/).length;

      document.getElementById("template").rows = lineCount;
      document.getElementById("template").innerHTML = this.responseText;

      if (this.responseText.indexOf("\n") != -1)
        document.getElementById("thumbnail").innerHTML = "<img src=\"https://img.youtube.com/vi/" + id + "/maxresdefault.jpg\" alt=\"Thumbnail\">";
    }
  }
  xhttp.open("GET", url, false);
  xhttp.send();
}

function fileReport()
{
  var page = document.getElementById("page").value;
  var id = document.getElementById("id").value;
  var desc = document.getElementById("desc").value;

  if (id == "")
    document.getElementById("response").innerHTML = "Please enter the URL or ID that caused the problem.";
  else
  {
    var url = appUrl + "?type=report&page=" + page  + "&id=" + id + "&desc=" + desc;
    var xhttp;

    if (window.XMLHttpRequest)
      xhttp = new XMLHttpRequest(); // For modern browsers
    else
      xhttp = new ActiveXObject("Microsoft.XMLHTTP"); // For IE5 and IE6

      xhttp.onreadystatechange = function()
      {
        if (this.readyState == 4 && this.status == 200)
          document.getElementById("response").innerHTML = this.responseText;
      };

    xhttp.open("GET", url, false);
    xhttp.send();
  }
}

function copyTemplate()
{
  var copyText = document.getElementById("template");

  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  document.execCommand("copy");
}
