var appUrl = "https://script.google.com/macros/s/AKfycbzm47208rTvNpu2pa-vhqdT53k9_F1l0j47nqlJOw/exec";
var reay = false;

document.onkeydown = logKey;

function logKey(e) {
  if (e.code == "Enter" && document.getElementById("inputText").value != "")
    document.getElementById("submitBtn").click();
}

function search()
{

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
  var id = document.getElementById("inputText").value;
  id = id.replace("{\"\":\"", "").replace("\"}", "").replace("&feature=youtu.be", "").replace(/&.*/, "").replace(/h.*=/, "");
  var url = appUrl + "?type=template&id=" + id;

  getUrlResponse(url, "template");
}

function report()
{
  var page = document.getElementById("page").value;
  var id = document.getElementById("id").value;
  var desc = document.getElementById("desc").value;

  if (id == "")
    document.getElementById("response").innerHTML = "Please enter the URL or ID that caused the problem.";
  else
  {
    var url = appUrl + "?type=report&page=" + page  + "&id=" + id + "&desc=" + desc;
    getUrlResponse(url, "report");
  }
}

function getUrlResponse(url, type)
{
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

      if (type == "template")
      {
        var id = url.split("id=").pop();
        var lineCount = response.split(/\n/).length + 1;

        document.getElementById("template").rows = lineCount;
        document.getElementById("template").innerHTML = response;

        if (response.indexOf("\n") != -1)
          document.getElementById("thumbnail").innerHTML = "<img src=\"https://img.youtube.com/vi/" + id + "/maxresdefault.jpg\" alt=\"Thumbnail\">";

      } else if (type == "report")
        document.getElementById("response").innerHTML = response;
    }
  };
}
