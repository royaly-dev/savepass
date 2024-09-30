window.addEventListener("load", (e) => {
    const init = window.update.init()

    if (init.first === true) {
        first()
    } else {
        supdate()
    }
})

async function first() {

    const form = document.querySelector("form")
    form.style.display = "unset"
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const Btn = document.querySelector("#sibmitBtn")
        Btn.disabled = true

        const master = document.querySelector("#master").value
        const verif = document.querySelector("#verif").value

        if (master !== verif) {
            document.querySelector("#info-form").innerText = "The password is not the same !"
        }
    })

    // ask to set the master password, and ask to create profil
    window.update.setmaster({master: master})
    window.update.savepassword()
}

async function supdate() {
    const infoUpdate = window.update.getUpdate()

    if (infoUpdate.new === true) {
        setTimeout(() => {
            window.update.startupdate()
        }, 1000);
    } else {
        window.update.finish()
        setTimeout(() => {
            window.close()
        }, 200);
    }
}