// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("new-topic");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Submit button stuff
var submit = document.getElementById("submit-btn");
var title = document.getElementById("topic-title");
var topic = document.getElementById("topic");
var content = document.getElementById("topic-content");
var username = document.getElementById("username");
var topicList = document.getElementById("topic-list");

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

submit.onclick = function(event) {
    event.preventDefault();

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        var trNode = document.createElement("tr");

        var tdNode1 = document.createElement("td");
        var aNode = document.createElement("a");
        aNode.id = 'topicID';
        aNode.href = '/topicfeed?thread=' + title.value;
        aNode.appendChild(document.createTextNode(title.value));
        tdNode1.appendChild(aNode);
        trNode.appendChild(tdNode1);

        var tdNode2 = document.createElement("td");
        tdNode2.appendChild(document.createTextNode(username.value));
        trNode.appendChild(tdNode2);

        var tdNode3 = document.createElement("td");
        tdNode3.appendChild(document.createTextNode('0'));
        trNode.appendChild(tdNode3);

        topicList.appendChild(trNode);

        modal.style.display = 'none';
      }
    }
    req.open('POST', '/addThread', true);
    req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    req.send('user=' + username.value  + '&subCategory=' + topic.value + '&threadName=' + title.value + '&content=' + content.value);
}

/*
var ThreadSchema = new Schema({
  'user': String,
  'subCategory': String,
  'threadName': String,
  'content': String,
  'count': { type: Number, default: 0 },
  'posted': { type: Date, default: Date.now() }
});
*/