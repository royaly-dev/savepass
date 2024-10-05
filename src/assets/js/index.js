let verifHandler = null;
let alldb = null;

function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener("load", async (e) => {
   window.db.all()
   const popup = document.createElement("form")
   popup.innerHTML = `
   <div class="div-container">
      <p id="error-msg"></p>
      <div style="width: 100%;">
         <input type="password" placeholder="Your master password" name="master" id="master" class="masterpass-textarea">         
      </div>
      <input id="sibmitBtn" type="submit" value="Check master password" class="submit-buttom">
   </div>
   `
   document.body.append(popup)
   const form = document.querySelector("form")

   window.db.onVerif(handleVerif);

   form.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("submit")
      const master = document.getElementById("master").value
      window.db.verif({ master: master, service: "big" })
   })

   const newpass = document.querySelector(".bouton-add")
   newpass.addEventListener("click", addNewPassword)

})

async function handleVerif(data) {
      if (data.confirm === true) {
         console.log("master password is correct")
         const data = await window.db.all()
         init(data)
         const error = document.getElementById("error-msg")
         error.innerText = "master password is correct"
      } else {
         const error = document.getElementById("error-msg")
         error.innerText = "master password is incorrect"
         console.log("master password is incorrect")
      }
}

async function init(data) {
   console.log(data)
   alldb = data
   document.querySelector(".list-password-1").innerHTML = ""
   for (let i = 0; i < data.length; i++) {
      if(data[i].username === "master") {
         continue;
      }

      console.log(String(data[i].service))

      const url = new URL(data[i].service);
      const hostname = url.hostname;
      const container = document.createElement("div")
      container.className = "list-password-container"
      console.log("url_" + String(i))
      container.id = data[i].service
      container.innerHTML = `
            <div class="list-password-1-1">
               <input type="checkbox">
               <img src="https://upload.royaly.dev/data/default.png" alt="Logo du site" class="logo-site"> 
               <div class="info-site"> 
               <p class="nom-site">${hostname}</p>
               <p id="${"url" + String(i)}" class="url-site">${decodeURI(data[i].service)}</p>
               </div>
               <p class="username">${data[i].username}</p>
               <p class="password">**********</p>
            </div>
            <div class="logo-action">
               <svg onclick="ModifService(this)" style="cursor: pointer;" width="20px"viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40974 4.40973 4.7157 4.21799 5.09202C4 5.51985 4 6.0799 4 7.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V12.5M15.5 5.5L18.3284 8.32843M10.7627 10.2373L17.411 3.58902C18.192 2.80797 19.4584 2.80797 20.2394 3.58902C21.0205 4.37007 21.0205 5.6364 20.2394 6.41745L13.3774 13.2794C12.6158 14.0411 12.235 14.4219 11.8012 14.7247C11.4162 14.9936 11.0009 15.2162 10.564 15.3882C10.0717 15.582 9.54378 15.6885 8.48793 15.9016L8 16L8.04745 15.6678C8.21536 14.4925 8.29932 13.9048 8.49029 13.3561C8.65975 12.8692 8.89125 12.4063 9.17906 11.9786C9.50341 11.4966 9.92319 11.0768 10.7627 10.2373Z" stroke="#808080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
               <svg onclick="deletepass(this)" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="18px" viewBox="0 0 13 14" fill="none">
                  <path d="M8.20214 4.98548H6.87158V10.5073H8.20214V4.98548Z" fill="#808080"></path>
                  <path d="M5.46239 4.98548H4.13184V10.5073H5.46239V4.98548Z" fill="#808080"></path>
                  <path d="M12.478 2.16712C12.4754 2.03061 12.4295 1.89846 12.3469 1.78975C12.2642 1.68104 12.1492 1.6014 12.0184 1.56232C11.9596 1.53782 11.8974 1.52252 11.8339 1.51696H8.28678C8.1525 1.07791 7.88082 0.693554 7.51174 0.420471C7.14265 0.147388 6.69564 0 6.23651 0C5.77738 0 5.33038 0.147388 4.96129 0.420471C4.5922 0.693554 4.32053 1.07791 4.18625 1.51696H0.639107C0.580679 1.51814 0.522686 1.52729 0.46674 1.54418H0.45162C0.313182 1.58701 0.193338 1.67547 0.11163 1.79515C0.0299214 1.91483 -0.00883041 2.05866 0.00169348 2.20319C0.0122174 2.34771 0.071396 2.48441 0.169579 2.59099C0.267763 2.69757 0.399158 2.76774 0.542339 2.79006L1.25298 12.5334C1.26382 12.9127 1.41693 13.2741 1.68191 13.5458C1.94688 13.8175 2.30435 13.9797 2.68332 14H9.78668C10.1662 13.9804 10.5244 13.8186 10.79 13.5468C11.0556 13.2751 11.2092 12.9132 11.22 12.5334L11.9277 2.79914C12.0802 2.77797 12.22 2.70232 12.3212 2.58615C12.4223 2.46999 12.478 2.32116 12.478 2.16712ZM6.23651 1.21456C6.3661 1.21458 6.49427 1.24146 6.61294 1.29351C6.73161 1.34556 6.8382 1.42164 6.92598 1.51696H5.54704C5.63459 1.42135 5.74114 1.34507 5.85986 1.29299C5.97859 1.24092 6.10687 1.21421 6.23651 1.21456ZM9.78668 12.7904H2.68332C2.60168 12.7904 2.47467 12.6573 2.45955 12.4457L1.75798 2.81123H10.715L10.0135 12.4457C9.99836 12.6573 9.87135 12.7904 9.78668 12.7904Z" fill="#808080"></path>
               </svg>
            </div>
      `
      document.querySelector(".list-password-1").append(container)
   }

   for (let i = 0; i < data.length; i++) {
      if(data[i].username === "master") {
         continue;
      }
      document.querySelector("#url" + String(i)).onclick = (() => openurl(data[i].service))
   }

   document.querySelector("form").style.display = "none"
}

function addNewPassword() {

   const popup = document.createElement("form")
   popup.id= "add-new-password"
   popup.innerHTML = `
   <div class="div-container">
      <p id="error-msg-pass"></p>
      <div style="width: 100%;">
         <input type="url" placeholder="Site URL" id="form-service" class="masterpass-textarea">
         <input type="text" placeholder="Username" id="form-username" class="masterpass-textarea">
         <input type="password" placeholder="Your password" id="form-password" class="masterpass-textarea">
      </div>
      <input id="sibmitBtn" type="submit" value="Add the service" class="submit-buttom">
   </div>
   `
   document.body.append(popup)

   const formPassword = document.getElementById("add-new-password")

   formPassword.addEventListener("submit", async (e) => {
      e.preventDefault()
      const service = document.getElementById("form-service").value
      const password = document.getElementById("form-password").value
      const username = document.getElementById("form-username").value
      const master = document.getElementById("master").value

      const add = await window.db.add({ service: service, username: username, password: password, master: master })

      if (add.confirm === false) {
         const error = document.getElementById("error-msg-pass")
         error.innerText = "service already exists"
         console.log("service already exists")
         return
      }

      window.db.save()
      
      setTimeout( async () => {
         const data = await window.db.all()
         console.log(data)
         init(data)
         document.getElementById("add-new-password").remove()
      }, 200);

   })
}


/**
 * @param {Document} element
 */

async function deletepass(element) {
   await window.db.delete({ service: element.parentElement.parentElement.id }).then( async () => {
      const res = await window.db.save()
      if (res.err !== true) {
         setTimeout( async () => {
            const data = await window.db.all()
            console.log(data)
            init(data)
         }, 200);
      }
   })
}

/**
 * @param {Document} element
 */

async function ModifService(element) {
   const service = element.parentElement.parentElement.id
   const servicedata = alldb.find(entry => entry.service === service)
   const data = await window.db.get({ service: String(service), master: document.getElementById("master").value })
   console.log(data)
   const popup = document.createElement("form")
   popup.id= "modif-password"
   popup.innerHTML = `
   <div class="div-container">
      <p id="error-msg-pass"></p>
      <div style="width: 100%;">
         <input type="url" placeholder="Site URL" value="${servicedata.service}" id="form-service" class="masterpass-textarea">
         <input type="text" placeholder="Username" value="${servicedata.username}" id="form-username" class="masterpass-textarea">
         <input type="password" placeholder="Your password" value="${data}" id="form-password" class="masterpass-textarea">
      </div>
      <input id="sibmitBtn" type="submit" value="Change the service" class="submit-buttom">
   </div>
   `
   document.body.append(popup)

   const modifservice = document.getElementById("modif-password")

   modifservice.addEventListener("submit", async (e) => {
      e.preventDefault()
      const service = document.getElementById("form-service").value
      const password = document.getElementById("form-password").value
      const username = document.getElementById("form-username").value
      const master = document.getElementById("master").value

      const add = await window.db.modif({ service: service, username: username, password: password, master: master })

      if (add.confirm === false) {
         const error = document.getElementById("error-msg-pass")
         error.innerText = "service already exists"
         console.log("service already exists")
         return
      } else {
         window.db.save()
         setTimeout( async () => {
            const data = await window.db.all()
            console.log(data)
            init(data)
            document.getElementById("modif-password").remove()
         }, 200);
      }
   })
}

function openurl(url) {
   console.log(url)
   window.db.openurl({ url: url })
}