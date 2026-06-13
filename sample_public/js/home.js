
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("inp");
const nameInput = document.getElementById("name-input");
const usersList = document.getElementById("users-list");
const joinChatButton = document.getElementById("join-chat");
const sendMsgButton = document.getElementById("send-msg");
const socket = new WebSocket(
    location.protocol === "https:"
        ? `wss://${location.host}`
        : `ws://${location.host}`
);
const userNamesList = []
joinChatButton.onclick = joinChat;
sendMsgButton.onclick = sendMessage;

function joinChat() {
    const name = nameInput.value;
    if (!name) return alert("Please enter your name");
    socket.send(JSON.stringify({ type: "JOIN",username: name }));
    localStorage.setItem("username", name);
    document.getElementById("login-page").style.display = "none";
    document.getElementById("chat-page").style.display = "block";
}

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function createUserMessage(message, isUser = null) {
    const messageDiv = document.createElement("div");
    isUser ? messageDiv.style.textAlign = "right" : messageDiv.style.textAlign = "left";
    const messageElement = document.createElement("div");
    messageElement.classList.add("card");
    const userMessageElement = document.createElement("p");
    userMessageElement.textContent = `${message}`;
    messageElement.appendChild(userMessageElement);
    messageDiv.appendChild(messageElement);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: "smooth"
    });
}

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "JOIN") {
        document.getElementById("online-users").textContent = `Online Users: ${data.count}`;
        console.log(data.userDb,"Usernames List");
        updateUserList(data.userDb);
        return;
    }
    if (data.type === "CHAT") {
        createUserMessage(`${data.username}: ${data.message}`);
    }
});

function updateUserList(userDb) {
    usersList.innerHTML = "";
    userDb.forEach((name) => {
        console.log(name,"Username");
        const userElementCard = document.createElement("div");
        userElementCard.classList.add("users-card");
        const userElement = document.createElement("p");
        const userElementLogo = document.createElement("div");
        userElementLogo.classList.add("users-logo-chip")
        const userElementLogoAlpha = document.createElement("p")
        userElementLogoAlpha.textContent = name[0].toUpperCase();
        userElementLogo.appendChild(userElementLogoAlpha);

        userElement.textContent = name;
        userElementCard.appendChild(userElementLogo);
        userElementCard.appendChild(userElement);
        usersList.appendChild(userElementCard);
        usersList.scrollTo({
            top: usersList.scrollHeight,
            behavior: "smooth"
        });
    });
}

updateUserList();

function sendMessage() {
    const username = localStorage.getItem("username");
    const message = input.value;
    createUserMessage(`You: ${message}`, true);
    socket.send(JSON.stringify({ type: "CHAT", message: message, username: username }));
    input.value = "";
}