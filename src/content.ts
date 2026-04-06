console.log("content loaded to this page !")

async function checkFrom() {
    const inputs = document.querySelectorAll("input")

    const hasPassAndEmail: {
        email: boolean
        password: boolean
        inputElementEmail: HTMLInputElement | null
        inputElementPassword: HTMLInputElement | null
    } = { email: false, password: false, inputElementEmail: null, inputElementPassword: null }

    for (const input of inputs) {
        if (input.type === "password") {
            hasPassAndEmail.password = true
            hasPassAndEmail.inputElementPassword = input
            input.style.borderColor = "red"
        } else if (input.type === "email" || input.type === "text" && (input.id === "user" || input.id === "username" || input.autocomplete === "username")) {
            hasPassAndEmail.email = true
            hasPassAndEmail.inputElementEmail = input
            input.style.borderColor = "red"
        }
    }

    if (hasPassAndEmail.email && hasPassAndEmail.password) {
        const req = await chrome.runtime.sendMessage("background_checkpass_" + location.host)
        if (req.split("_")[2] === "succes") {
            console.log("succes")
        }
    }
}

if (document.readyState === "complete") {
    checkFrom()
} else {
    window.addEventListener("load", checkFrom)
}