var y=n=>{throw TypeError(n)};var f=(n,e,t)=>e.has(n)||y("Cannot "+t);var l=(n,e,t)=>(f(n,e,"read from private field"),t?t.call(n):e.get(n)),p=(n,e,t)=>e.has(n)?y("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,t),m=(n,e,t,a)=>(f(n,e,"write to private field"),a?a.call(n,t):e.set(n,t),t),v=(n,e,t)=>(f(n,e,"access private method"),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();const h={BASE_URL:"https://story-api.dicoding.dev/v1"},k={STORIES:`${h.BASE_URL}/stories`};async function I(n){try{return(await(await fetch(k.STORIES,{headers:n?{Authorization:`Bearer ${n}`}:{}})).json()).listStory||[]}catch(e){return console.error("Error fetching stories:",e),[]}}async function P(n){const e=localStorage.getItem("token");try{return await(await fetch(k.STORIES,{method:"POST",headers:e?{Authorization:`Bearer ${e}`}:{},body:n})).json()}catch(t){throw console.error("Error adding story:",t),t}}async function A(n){try{return await(await fetch(`${h.BASE_URL}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).json()}catch(e){throw console.error("Error registering user:",e),e}}async function M(n){try{return await(await fetch(`${h.BASE_URL}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).json()}catch(e){throw console.error("Error logging in:",e),e}}class w{constructor(){this.dbName="story-app-db",this.version=1,this.db=null}async init(){return new Promise((e,t)=>{const a=indexedDB.open(this.dbName,this.version);a.onerror=()=>t(a.error),a.onsuccess=()=>{this.db=a.result,e()},a.onupgradeneeded=r=>{const i=r.target.result;i.objectStoreNames.contains("offline-stories")||i.createObjectStore("offline-stories",{keyPath:"id",autoIncrement:!0}).createIndex("createdAt","createdAt",{unique:!1}),i.objectStoreNames.contains("favorites")||i.createObjectStore("favorites",{keyPath:"id"}),i.objectStoreNames.contains("stories")||i.createObjectStore("stories",{keyPath:"id"}).createIndex("createdAt","createdAt",{unique:!1})}})}async saveStory(e){const a=this.db.transaction(["offline-stories"],"readwrite").objectStore("offline-stories");return new Promise((r,i)=>{const s=a.add(e);s.onsuccess=()=>r(s.result),s.onerror=()=>i(s.error)})}async getAllStories(){const t=this.db.transaction(["stories"],"readonly").objectStore("stories");return new Promise((a,r)=>{const i=t.getAll();i.onsuccess=()=>a(i.result),i.onerror=()=>r(i.error)})}async saveStoriesToCache(e){const a=this.db.transaction(["stories"],"readwrite").objectStore("stories");await new Promise((r,i)=>{const s=a.clear();s.onsuccess=()=>r(),s.onerror=()=>i(s.error)});for(const r of e)await new Promise((i,s)=>{const o=a.add(r);o.onsuccess=()=>i(),o.onerror=()=>s(o.error)})}async getFavorites(){const t=this.db.transaction(["favorites"],"readonly").objectStore("favorites");return new Promise((a,r)=>{const i=t.getAll();i.onsuccess=()=>{const s=i.result.map(o=>o.id);a(s)},i.onerror=()=>r(i.error)})}async toggleFavorite(e){const a=this.db.transaction(["favorites"],"readwrite").objectStore("favorites");return new Promise(async(r,i)=>{const s=a.get(e);s.onsuccess=()=>{if(s.result){const o=a.delete(e);o.onsuccess=()=>r(!1),o.onerror=()=>i(o.error)}else{const o=a.add({id:e});o.onsuccess=()=>r(!0),o.onerror=()=>i(o.error)}},s.onerror=()=>i(s.error)})}async deleteStory(e){const a=this.db.transaction(["stories"],"readwrite").objectStore("stories");return new Promise((r,i)=>{const s=a.delete(e);s.onsuccess=()=>r(),s.onerror=()=>i(s.error)})}async getOfflineStories(){const t=this.db.transaction(["offline-stories"],"readonly").objectStore("offline-stories");return new Promise((a,r)=>{const i=t.getAll();i.onsuccess=()=>a(i.result),i.onerror=()=>r(i.error)})}async clearOfflineStories(){const t=this.db.transaction(["offline-stories"],"readwrite").objectStore("offline-stories");return new Promise((a,r)=>{const i=t.clear();i.onsuccess=()=>a(),i.onerror=()=>r(i.error)})}}class T{constructor(){this.registration=null,this.isSubscribed=!1}async init(){if("serviceWorker"in navigator&&"PushManager"in window)try{this.registration=await navigator.serviceWorker.ready;const e=await this.registration.pushManager.getSubscription();return this.isSubscribed=!!e,e||await this.subscribe(),!0}catch(e){return console.error("Push notification initialization failed:",e),!1}return!1}async subscribe(){try{(await fetch(`${h.BASE_URL}/notifications/subscribe`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify({endpoint:"push-endpoint",keys:{p256dh:"sample-p256dh-key",auth:"sample-auth-key"}})})).ok&&(this.isSubscribed=!0,console.log("Successfully subscribed to push notifications"))}catch(e){console.error("Subscription failed:",e)}}async unsubscribe(){try{const e=await this.registration.pushManager.getSubscription();e&&(await e.unsubscribe(),this.isSubscribed=!1,await fetch(`${h.BASE_URL}/notifications/unsubscribe`,{method:"POST",headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}),console.log("Successfully unsubscribed from push notifications"))}catch(e){console.error("Unsubscription failed:",e)}}getSubscriptionStatus(){return this.isSubscribed}async sendNotification(e,t,a="/favicon.png",r=null){if(this.registration){const i={body:t,icon:a,badge:"/favicon.png",vibrate:[100,50,100],data:{storyId:r,dateOfArrival:Date.now()},actions:[{action:"view",title:"Lihat Cerita",icon:"/favicon.png"},{action:"close",title:"Tutup"}]};await this.registration.showNotification(e,i)}}}class C{async render(){return`
      <section class="container">
        <h1>Beranda</h1>
          <div class="filter-container">
          <h2>Filter Lokasi</h2>
          <label for="location-filter">Cari lokasi:</label>
          <input type="text" id="location-filter" placeholder="Cari lokasi..." aria-describedby="filter-help">
          <span id="filter-help" class="sr-only">Masukkan nama lokasi atau deskripsi untuk memfilter cerita</span>
          <div class="notification-controls">
            <button id="notification-toggle" aria-label="Toggle push notifications">🔔 Enable Notifications</button>
          </div>
        </div>
        <div class="content-wrapper">
          <h2>Daftar Cerita</h2>
          <div class="story-list" id="story-list" role="list" aria-label="Daftar cerita"></div>
          <div class="map-container">
            <h3>Peta Lokasi Cerita</h3>
            <div id="map" style="height: 500px;" role="img" aria-label="Peta lokasi cerita"></div>
          </div>
        </div>
      </section>
    `}async afterRender(){console.log("HomePage afterRender called"),this.dbManager=new w,await this.dbManager.init(),this.pushManager=new T,await this.pushManager.init();const e=localStorage.getItem("token");try{this.stories=await I(e),await this.dbManager.saveStoriesToCache(this.stories)}catch{this.stories=await this.dbManager.getAllStories()}this.favorites=await this.dbManager.getFavorites(),this._renderStories(),this._initializeMap(),this._setupFilter(),this._setupFavorites(),this._setupNotificationToggle(),this._checkAuthentication()}_checkAuthentication(){const e=JSON.parse(localStorage.getItem("user"));if(e){const t=document.querySelector(".nav-list"),a=document.createElement("li");a.innerHTML=`<a href="#" id="logout-link">Logout (${e.name})</a>`,t.appendChild(a),document.getElementById("logout-link").addEventListener("click",r=>{r.preventDefault(),localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.hash="#/login"})}}_renderStories(){console.log("Rendering stories:",this.stories.length);const e=document.getElementById("story-list");e.innerHTML=this.stories.map(t=>{var a;return`
      <div class="story-item" data-id="${t.id}" role="listitem" tabindex="0" aria-label="Cerita: ${t.name}">
        <img src="${t.photoUrl}" alt="${t.name}" loading="lazy">
        <h3>${t.name}</h3>
        <p>${t.description}</p>
        <small>${new Date(t.createdAt).toLocaleDateString()}</small>
        <button class="favorite-btn" data-id="${t.id}" aria-label="Toggle favorite">
          ${(a=this.favorites)!=null&&a.includes(t.id)?"❤️":"🤍"}
        </button>
        <button class="delete-btn" data-id="${t.id}" aria-label="Delete story">🗑️</button>
      </div>
    `}).join(""),e.addEventListener("click",t=>{const a=t.target.closest(".story-item");if(a&&!t.target.classList.contains("favorite-btn")&&!t.target.classList.contains("delete-btn")){const r=a.dataset.id,i=this.stories.find(s=>s.id===r);i&&this.markers[r]&&(this.map.setView([i.lat,i.lon],15),this.markers[r].openPopup())}})}_initializeMap(){console.log("Initializing map...");const e=document.getElementById("map");if(console.log("Map container:",e),!e){console.error("Map container not found!");return}try{this.map=L.map("map").setView([-6.2,106.816666],10),console.log("Map created:",this.map);const t=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}),a=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"© Esri"}),r={OpenStreetMap:t,Satellite:a};t.addTo(this.map),L.control.layers(r).addTo(this.map),console.log("Tile layers added"),this.markers={},this.stories.forEach(i=>{const s=L.marker([i.lat,i.lon]).addTo(this.map);s.bindPopup(`
          <b>${i.name}</b><br>
          ${i.description}<br>
          <img src="${i.photoUrl}" alt="${i.name}" style="width: 100px; height: auto;">
        `),this.markers[i.id]=s}),console.log("Markers added:",Object.keys(this.markers).length)}catch(t){console.error("Error initializing map:",t)}}_setupFilter(){document.getElementById("location-filter").addEventListener("input",t=>{const a=t.target.value.toLowerCase(),r=this.stories.filter(s=>s.name.toLowerCase().includes(a)||s.description.toLowerCase().includes(a)),i=document.getElementById("story-list");i.innerHTML=r.map(s=>{var o;return`
        <div class="story-item" data-id="${s.id}">
          <img src="${s.photoUrl}" alt="${s.name}" loading="lazy">
          <h3>${s.name}</h3>
          <p>${s.description}</p>
          <small>${new Date(s.createdAt).toLocaleDateString()}</small>
          <button class="favorite-btn" data-id="${s.id}" aria-label="Toggle favorite">
            ${(o=this.favorites)!=null&&o.includes(s.id)?"❤️":"🤍"}
          </button>
          <button class="delete-btn" data-id="${s.id}" aria-label="Delete story">🗑️</button>
        </div>
      `}).join(""),Object.values(this.markers).forEach(s=>this.map.removeLayer(s)),this.markers={},r.forEach(s=>{const o=L.marker([s.lat,s.lon]).addTo(this.map);o.bindPopup(`
          <b>${s.name}</b><br>
          ${s.description}<br>
          <img src="${s.photoUrl}" alt="${s.name}" style="width: 100px; height: auto;">
        `),this.markers[s.id]=o})})}_setupFavorites(){document.getElementById("story-list").addEventListener("click",async t=>{if(t.target.classList.contains("favorite-btn")){t.preventDefault();const a=t.target.dataset.id,r=await this.dbManager.toggleFavorite(a);r?this.favorites.push(a):this.favorites=this.favorites.filter(i=>i!==a),t.target.textContent=r?"❤️":"🤍"}if(t.target.classList.contains("delete-btn")){t.preventDefault();const a=t.target.dataset.id;await this.dbManager.deleteStory(a),this.stories=this.stories.filter(r=>r.id!==a),this.markers[a]&&(this.map.removeLayer(this.markers[a]),delete this.markers[a]),this._renderStories()}})}_setupNotificationToggle(){const e=document.getElementById("notification-toggle");if(e){const t=this.pushManager.getSubscriptionStatus();e.textContent=t?"🔕 Disable Notifications":"🔔 Enable Notifications",e.addEventListener("click",async()=>{this.pushManager.getSubscriptionStatus()?(await this.pushManager.unsubscribe(),e.textContent="🔔 Enable Notifications"):(await this.pushManager.subscribe(),e.textContent="🔕 Disable Notifications")})}}}class B{async render(){return`
      <section class="container">
        <h1>Tambah Cerita Baru</h1>
        <h2>Form Tambah Cerita</h2>
        <form id="add-story-form" aria-labelledby="form-title">
          <div>
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" required aria-describedby="desc-help"></textarea>
            <span id="desc-help" class="sr-only">Masukkan deskripsi cerita Anda</span>
          </div>
          <div>
            <label for="photo">Foto:</label>
            <input type="file" id="photo" name="photo" accept="image/*" required aria-describedby="photo-help">
            <span id="photo-help" class="sr-only">Pilih file gambar atau gunakan kamera</span>
            <button type="button" id="camera-button" aria-label="Ambil foto dari kamera">Ambil dari Kamera</button>
          </div>
          <div id="map-container">
            <label for="map">Klik pada peta untuk memilih lokasi:</label>
            <div id="map" style="height: 300px;" role="img" aria-label="Peta untuk memilih lokasi cerita"></div>
          </div>
          <button type="submit" aria-describedby="submit-help">Tambah Cerita</button>
          <span id="submit-help" class="sr-only">Kirim cerita baru dengan deskripsi, foto, dan lokasi</span>
        </form>
        <div id="message" role="status" aria-live="polite"></div>
      </section>
    `}async afterRender(){this.dbManager=new w,await this.dbManager.init(),this._initializeMap(),this._setupForm(),this._setupCamera()}_initializeMap(){this.map=L.map("map").setView([-6.2,106.816666],10),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(this.map),this.marker=null,this.map.on("click",e=>{this.marker&&this.map.removeLayer(this.marker),this.marker=L.marker(e.latlng).addTo(this.map),this.lat=e.latlng.lat,this.lon=e.latlng.lng})}_setupForm(){const e=document.getElementById("add-story-form");e.addEventListener("submit",async t=>{var i;t.preventDefault();const a=new FormData(e);a.append("lat",this.lat),a.append("lon",this.lon);const r={description:a.get("description"),photo:a.get("photo"),lat:this.lat,lon:this.lon,token:localStorage.getItem("token"),createdAt:new Date().toISOString()};try{const s=await P(a);document.getElementById("message").textContent="Cerita berhasil ditambahkan!","serviceWorker"in navigator&&await(await navigator.serviceWorker.ready).showNotification("Cerita Baru Ditambahkan!",{body:`Cerita "${r.description.substring(0,50)}..." telah berhasil dipublikasikan.`,icon:"/favicon.png",badge:"/favicon.png",vibrate:[100,50,100],data:{storyId:(i=s.story)==null?void 0:i.id,dateOfArrival:Date.now()},actions:[{action:"view",title:"Lihat Cerita",icon:"/favicon.png"}]}),e.reset(),this.marker&&this.map.removeLayer(this.marker)}catch{await this.dbManager.saveStory(r),document.getElementById("message").textContent="Cerita disimpan offline. Akan disinkronkan saat online.","serviceWorker"in navigator&&"sync"in window.ServiceWorkerRegistration.prototype&&await(await navigator.serviceWorker.ready).sync.register("background-sync-stories"),e.reset(),this.marker&&this.map.removeLayer(this.marker)}})}_setupCamera(){const e=document.getElementById("camera-button"),t=document.getElementById("photo");e.addEventListener("click",async()=>{try{const a=await navigator.mediaDevices.getUserMedia({video:!0}),r=document.createElement("video");r.srcObject=a,r.play();const i=document.createElement("canvas"),s=i.getContext("2d");setTimeout(()=>{i.width=r.videoWidth,i.height=r.videoHeight,s.drawImage(r,0,0),i.toBlob(o=>{const E=new File([o],"camera-photo.jpg",{type:"image/jpeg"}),b=new DataTransfer;b.items.add(E),t.files=b.files}),a.getTracks().forEach(o=>o.stop())},3e3)}catch(a){console.error("Error accessing camera:",a)}})}}class D{async render(){return`
      <section class="container">
        <h1>Daftar</h1>
        <h2>Form Pendaftaran</h2>
        <form id="register-form" aria-labelledby="register-title">
          <div>
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required aria-describedby="name-help">
            <span id="name-help" class="sr-only">Masukkan nama lengkap Anda</span>
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-describedby="email-help">
            <span id="email-help" class="sr-only">Masukkan alamat email Anda</span>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required aria-describedby="password-help">
            <span id="password-help" class="sr-only">Masukkan kata sandi Anda</span>
          </div>
          <button type="submit" aria-describedby="register-help">Daftar</button>
          <span id="register-help" class="sr-only">Buat akun baru</span>
        </form>
        <div id="message" role="status" aria-live="polite"></div>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `}async afterRender(){this._setupForm()}_setupForm(){const e=document.getElementById("login-form");e.addEventListener("submit",async t=>{t.preventDefault();const a=new FormData(e),r=Object.fromEntries(a);try{(await A(r)).error===!1?(document.getElementById("message").textContent="Pendaftaran berhasil! Silakan login.",window.location.hash="#/login"):document.getElementById("message").textContent="Pendaftaran gagal. Periksa data Anda."}catch{document.getElementById("message").textContent="Terjadi kesalahan. Silakan coba lagi."}})}}class x{async render(){return`
      <section class="container">
        <h1>Login</h1>
        <h2>Form Login</h2>
        <form id="login-form" aria-labelledby="login-title">
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-describedby="email-help">
            <span id="email-help" class="sr-only">Masukkan alamat email Anda</span>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required aria-describedby="password-help">
            <span id="password-help" class="sr-only">Masukkan kata sandi Anda</span>
          </div>
          <button type="submit" aria-describedby="login-help">Login</button>
          <span id="login-help" class="sr-only">Masuk ke akun Anda</span>
        </form>
        <div id="message" role="status" aria-live="polite"></div>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `}async afterRender(){this._setupForm()}_setupForm(){const e=document.getElementById("login-form");e.addEventListener("submit",async t=>{t.preventDefault();const a=new FormData(e),r=Object.fromEntries(a);try{const i=await M(r);i.error===!1?(localStorage.setItem("token",i.loginResult.token),localStorage.setItem("user",JSON.stringify(i.loginResult)),document.getElementById("message").textContent="Login berhasil!",window.location.hash="#/"):document.getElementById("message").textContent="Login gagal. Periksa email dan password."}catch{document.getElementById("message").textContent="Terjadi kesalahan. Silakan coba lagi."}})}}class ${async render(){return`
      <section class="container">
        <h1>Tentang Aplikasi</h1>
        <p>Aplikasi ini adalah platform untuk berbagi cerita dengan lokasi geografis. Pengguna dapat menambahkan cerita dengan foto dan lokasi, serta melihat cerita dari pengguna lain di peta interaktif.</p>
        <h2>Fitur Utama</h2>
        <ul>
          <li>Tambah cerita dengan foto dan lokasi</li>
          <li>Lihat cerita di peta interaktif</li>
          <li>Filter cerita berdasarkan lokasi</li>
          <li>Autentikasi pengguna</li>
        </ul>
        <h2>Teknologi yang Digunakan</h2>
        <ul>
          <li>HTML, CSS, JavaScript</li>
          <li>Leaflet untuk peta</li>
          <li>View Transitions API untuk transisi halaman</li>
        </ul>
      </section>
    `}async afterRender(){}}const O={"/":new C,"/add-story":new B,"/register":new D,"/login":new x,"/about":new $};function j(n){const e=n.split("/");return{resource:e[1]||null,id:e[2]||null}}function N(n){let e="";return n.resource&&(e=e.concat(`/${n.resource}`)),n.id&&(e=e.concat("/:id")),e||"/"}function _(){return location.hash.replace("#","")||"/"}function q(){const n=_(),e=j(n);return N(e)}var d,u,c,g,S;class F{constructor({navigationDrawer:e,drawerButton:t,content:a}){p(this,g);p(this,d,null);p(this,u,null);p(this,c,null);m(this,d,a),m(this,u,t),m(this,c,e),v(this,g,S).call(this)}async renderPage(){const e=q(),t=O[e];if(!document.startViewTransition){l(this,d).innerHTML=await t.render(),await t.afterRender();return}const a=document.startViewTransition(async()=>{l(this,d).innerHTML=await t.render(),await t.afterRender()});a.updateCallbackDone.then(()=>{console.log("Callback telah dieksekusi.")}),a.ready.then(()=>{console.log("View transition siap dijalankan.")}),a.finished.then(()=>{console.log("View transition telah selesai.")})}_hideAuthLinks(){document.getElementById("nav-list").querySelectorAll("li:nth-child(3), li:nth-child(4)").forEach(a=>a.style.display="none")}}d=new WeakMap,u=new WeakMap,c=new WeakMap,g=new WeakSet,S=function(){l(this,u).addEventListener("click",()=>{l(this,c).classList.toggle("open")}),document.body.addEventListener("click",e=>{!l(this,c).contains(e.target)&&!l(this,u).contains(e.target)&&l(this,c).classList.remove("open"),l(this,c).querySelectorAll("a").forEach(t=>{t.contains(e.target)&&l(this,c).classList.remove("open")})})};document.addEventListener("DOMContentLoaded",async()=>{if("serviceWorker"in navigator)try{const a=await navigator.serviceWorker.register("/sw.js");if(console.log("Service Worker registered successfully:",a),"Notification"in window){const r=await Notification.requestPermission();console.log("Notification permission:",r)}}catch(a){console.error("Service Worker registration failed:",a)}let n;const e=document.createElement("button");e.textContent="Install App",e.style.cssText=`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    display: none;
    z-index: 1000;
  `,document.body.appendChild(e),window.addEventListener("beforeinstallprompt",a=>{a.preventDefault(),n=a,e.style.display="block"}),e.addEventListener("click",async()=>{if(n){n.prompt();const{outcome:a}=await n.userChoice;console.log(`User response to install prompt: ${a}`),n=null,e.style.display="none"}}),window.addEventListener("appinstalled",()=>{console.log("App was installed"),e.style.display="none"});const t=new F({content:document.querySelector("#main-content"),drawerButton:document.querySelector("#drawer-button"),navigationDrawer:document.querySelector("#navigation-drawer")});await t.renderPage(),window.addEventListener("hashchange",async()=>{await t.renderPage()})});
