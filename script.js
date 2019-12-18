function formSubmit()
{
  var id = document.getElementById("textBox").value
  id = id.replace("{\"\":\"", "").replace("\"}", "").replace("&feature=youtu.be", "").replace(/&.*/, "").replace(/h.*=/, "");
  var url = "https://script.google.com/macros/s/AKfycbzLY3ZuV12x139Qgz00GM6wZ1GJQaQN2tCeEIJp/exec?id=" + id;
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
      document.getElementById("thumbnail").innerHTML = "<img src=\"https://img.youtube.com/vi/" + id + "/maxresdefault.jpg\" alt=\"Thumbnail\">";
    }
  };

  xhttp.open("GET", url, false);
  xhttp.send();
}

function copyTemplate()
{
  var copyText = document.getElementById("template");

  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  document.execCommand("copy");
}
