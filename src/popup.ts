window.addEventListener("load", async () => {
    console.log("loaded !")
    const data: { link: string, email: string, password: string } = JSON.parse(await chrome.runtime.sendMessage("background_getLast"))
    if (data.link) {

        (<HTMLDivElement>document.querySelector("#loading")).style.display = "none";
        (<HTMLDivElement>document.querySelector("#showPass")).style.display = "flex"

    } else {
        const isConnected = await chrome.runtime.sendMessage("background_status")
        console.log(isConnected)
        if (isConnected === "background_status_succes") {
            document.querySelector("#main_msg").textContent = "SavePass is connected !";
            (<HTMLParagraphElement>document.querySelector("#main_msg")).style.color = "#1a851a"
        } else {
            document.querySelector("#main_msg").textContent = "SavePass is not connected !";
            (<HTMLParagraphElement>document.querySelector("#main_msg")).style.color = "#e21e1e"
        }
    }
})