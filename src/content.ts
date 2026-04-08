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

chrome.runtime.onMessage.addListener(async (message: string, sender: chrome.runtime.MessageSender) => {
    const arg = message.split("_")
    if (arg[0] === "popup") {
        switch (arg[1]) {
            case "apply":
                const data: { type: "find" | "new", link: string, email: string, password: string } = await chrome.runtime.sendMessage("background_getLast")
                applyFrom(data)
                break;

            default:
                break;
        }
    }
})

async function applyFrom(data: { type: "find" | "new", link: string, email: string, password: string }) {
    const inputs = document.querySelectorAll("input")

    for (const input of inputs) {
        if (input.type === "password") {
            input.textContent = data.password
        } else if (input.type === "email" || input.type === "text" && (input.id === "user" || input.id === "username" || input.autocomplete === "username")) {
            input.textContent = data.email
        }
    }
}