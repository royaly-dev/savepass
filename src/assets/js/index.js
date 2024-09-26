window.addEventListener("load", async (e) => {
   const test = await window.db.get()
   console.log(await JSON.parse(test))
})