function sendMessage() {
    var userInput = document.getElementById("userInput").value;
    var loadingElement = document.getElementById("loading");
    loadingElement.style.display = 'block'; 

    fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userInput })
    })
    .then(response => response.json())
    .then(data => {
        loadingElement.style.display = 'none'; 
        document.getElementById("response-container").innerText = data.reply;
    })
    .catch((error) => {
        loadingElement.style.display = 'none'; 
        console.error('Error:', error);
    });
}
