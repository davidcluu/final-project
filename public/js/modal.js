// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("new-topic");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Submit button stuff
var submit = document.getElementById("submit-btn");
var category = document.getElementById("category-title");
var title = document.getElementById("topic-title");
var username = document.getElementById("username");

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
        modal.style.display = 'none';
      }
    }
    req.open('POST', '/addTopic', true);
    req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    req.send('category=' + category.value + '&title=' + title.value + '&username=' + username.value);
}