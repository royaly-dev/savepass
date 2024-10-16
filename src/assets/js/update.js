window.addEventListener("load", async (e) => {
    const init = await window.update.init()

    if (init.first === true) {
        first()
    } else {
        supdate()
    }
})

async function first() {

    const form = document.querySelector("form")
    form.style.display = "flex"
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const Btn = document.querySelector("#sibmitBtn")
        Btn.disabled = true

        const master = document.querySelector("#master").value
        const verif = document.querySelector("#verif").value

        if (master !== verif) {
            document.querySelector("#info-form").innerText = "The password is not the same !"
            Btn.disabled = false
        }

        const setmaster = await window.update.setmaster({master: String(master)})

        window.update.onPasswordcreated((data) => {
            window.update.savepassword()
            if (data.confirm === true) {
                supdate()
            }
        });

    })
}

async function supdate() {

    document.querySelector(".setup").style.display = "none"
    document.querySelector(".update").style.display = "flex"

    const infoUpdate = await window.update.getUpdate()

    if (infoUpdate.available === true) {
        document.querySelector(".update").innerText = "Downloading Update ..."
        setTimeout(() => {
            window.update.downloadupdate()
        }, 1000);
        window.update.onUpdateDownload((data) => {
            const progress = `${data}%`
            document.querySelector(".update-info").querySelector("div").style.background = `linear-gradient(to right, #4caf50 0%, #4caf50 ${progress}, #9dcaf0 ${progress}, #9dcaf0 100%)`
            if (data === "100") {
                document.querySelector(".update-info").querySelector("p").innerText = "Installing update..."
                setTimeout(() => {
                    window.update.update()
                }, 200);
            }
        });
    } else {
        window.update.finish()
        setTimeout(() => {
            window.close()
        }, 200);
    }
}