window.addEventListener("load", (e) => {
    const init = window.update.init()

    if (init.first === true) {
        first()
    } else {
        supdate()
    }
})

async function first() {
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