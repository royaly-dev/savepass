console.log("content loaded to this page !")

async function checkFrom() {
    const inputs = document.querySelectorAll("input")

    const hasPassAndEmail = { email: false, password: false }

    for (const input of inputs) {
        if (input.type === "password") {
            hasPassAndEmail.password = true
        } else if (input.type === "email" || input.type === "text" && (input.id === "user" || input.id === "username" || input.autocomplete === "username")) {
            hasPassAndEmail.email = true
        }
    }

    if (hasPassAndEmail.email && hasPassAndEmail.password) {
        chrome.runtime.sendMessage("checkpass_" + location.host)
    }
}

if (document.readyState === "complete") {
    checkFrom()
} else {
    window.addEventListener("load", checkFrom)
}