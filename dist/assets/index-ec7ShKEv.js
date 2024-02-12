(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))e(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&e(n)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();const S=document.querySelector(".theme-switcher"),p=document.documentElement,g=document.querySelector("main"),l=document.querySelector(".countries"),_=document.querySelector(".detail-container"),w=document.querySelector("#search"),$=document.querySelector("form"),h=document.querySelector(".main-area"),f=document.querySelector(".detail-area"),d=document.querySelector(".search__filter"),E=document.querySelector(".search__filter-dropdown"),c=document.querySelector(".btn-sort"),O=document.querySelector(".btn-back"),y=document.querySelector(".dynamic-txt");let u="lowest";class k{constructor(){this.addEvents()}async onDOMLoad(){let s=localStorage.getItem("theme"),t=s;s||(t=window.matchMedia("(prefers-color-scheme : dark").matches?"dark":"light"),p.setAttribute("data-theme",t)}toggleTheme(){let s=p.getAttribute("data-theme"),t;t=s==="light"?"dark":"light",localStorage.setItem("theme",t),p.setAttribute("data-theme",t)}observerFun(s,t){s.forEach(e=>{g.classList.toggle("active",e.isIntersecting)})}async fetchJSON(s,t){try{const e=await fetch(s,t);if(!e.ok)throw new Error(`Status: ${e.status}`);return e.json()}catch(e){throw console.error("Error fetching JSON:",e.message),e}}timeout(s){return new Promise((t,e)=>{setTimeout(()=>{e(new Error("timeout"))},s*1e3)})}requestOpts(){const s=new Headers;return s.append("X-CSCAPI-KEY","R2JEWjN5SjA1akRsNWx3U21jeVJvbHYwdTlsdzhudEdYdWRiUllBSQ=="),{method:"GET",headers:s,redirect:"follow"}}async getCountryData(s,t){try{const[e,a]=await Promise.all([this.fetchJSON(`https://api.countrystatecity.in/v1/countries/${t}`,this.requestOpts()),this.fetchJSON(`https://restcountries.com/v3.1/name/${s}`)]);return[e,a]}catch{}}async getCountry(s,t,e=!0){try{e?l.innerHTML=this.generateSkelton(3):l.innerHTML=this.generateSkelton(1);const a=await Promise.race([this.fetchJSON(`https://restcountries.com/v3.1/${s}/${t}`),this.timeout(3)]),i=a.filter(n=>n.altSpellings.includes(t.toUpperCase())||n.name.common.toLowerCase().includes(t));e?this.displayCountries(this.sortCountries(a,"region")):i.length>0?(c.classList.add("display-none"),this.displayCountries(i)):this.displayError(l,"Country not found 🌎❓"),c.addEventListener("click",n=>{this.displayCountries(this.sortCountries(a,"population"))})}catch(a){console.error(a),a.message==="timeout"?this.displayError(l,"Request time out ⌚. Try again!"):this.displayError(l,`Country not found. ${a.message} 🌎❓`)}}sortCountries(s,t="region"){if(c.classList.remove("display-none"),t==="region")return s.sort((e,a)=>e.name.common.localeCompare(a.name.common));if(t==="population")return u=u==="lowest"?"highest":"lowest",u==="highest"?(c.textContent="Sort by lowest population",s.sort((e,a)=>a.population-e.population)):(c.textContent="Sort by highest population",s.sort((e,a)=>e.population-a.population))}toggleFilter(s){d.classList.toggle("active")}filterCountry(s){if(s.target.classList.contains(".search__filter-item"))return;const t=s.target.textContent.toLowerCase().trim(),e=d.querySelector(".search__filter-btn span"),a=document.querySelectorAll(".search__filter-item");this.getCountry("region",t,!0),e.textContent=t,a.forEach(i=>i.classList.remove("search__filter-item--selected")),s.target.classList.add("search__filter-item--selected")}displayCountries(s){l.innerHTML="",(Array.isArray(s)?s:[s]).forEach(e=>{const a=`<article class="country">
      <figure class="country__image">
        <img src="${e==null?void 0:e.flags.svg}" alt="${e.flags.alt!==void 0?e.flags.alt:e.name.common+"'s flag"}" />
      </figure>
      <div
        class="country__content | flex flex-justify-center flex-column gap-100"
      >
        <p class="country__txt">
          <span>Name :</span> <span class="country__name">${e.name.common}</span>
        </p>
        <p class="country__txt">
          <span>Population :</span>
          <span class="country__population">${e.population}</span>
        </p>
        <p class="country__txt">
          <span>Region :</span>
          <span class="country__region">${e.region}</span>
        </p>
        <p class="country__txt">
          <span>Capital :</span>
          <span class="country__capital">${e.capital||"Not found"}</span>
        </p>
      </div>
      <button class="btn btn--default country__btn" data-country-code="${e.cca2}" data-country-name="${e.name.common}">Details</button>
    </article>`;l.insertAdjacentHTML("beforeend",a)})}generateSkelton(s){return l.innerHTML="",`<article class="skelton">
    <div class="skelton__head"></div>
    <div
      class="skelton__content | flex flex-justify-center flex-column gap-100"
    >
      <div class="skelton__txt"></div>
      <div class="skelton__txt"></div>
      <div class="skelton__txt"></div>
      <div class="skelton__txt"></div>
    </div>
    <div class="skelton__btn"></div>
     </article>`.repeat(s)}displayError(s,t){const e=document.createElement("p");e.classList.add("error"),e.textContent=t,s.innerHTML="",s.insertAdjacentElement("beforeend",e)}async getCountryDetails(s){var i,n;if(!s.target.classList.contains("country__btn"))return;const t=s.target,e=t.dataset.countryName,a=t.dataset.countryCode;h.classList.add("display-none"),f.classList.remove("display-none");try{let[r,o]=await this.getCountryData(e,a);[o]=o.filter(x=>x.name.common.toLowerCase()===e.toLowerCase());const C=await this.getStates(a)||["NONE"],L=await this.getCities(a)||["NONE"],b=[Object.values(o.languages)],m=[{name:r.name,nativeName:r.native,region:r.region,subRegion:r.subregion,capital:r.capital,tld:r.tld,phoneCode:r.phonecode,currency:r.currency_name,population:o.population,languages:b,flag:(i=o.flags)==null?void 0:i.svg,flagAlt:(n=o.flags)==null?void 0:n.alt,nationality:r.nationality,borders:o==null?void 0:o.borders,states:C,cities:L,map:o.maps.googleMaps}];this.displayCountryDetail(m),console.log(m)}catch{this.displayError(y,"Failed to get details. 🌎❓")}}async getStates(s){try{return await this.fetchJSON(`https://api.countrystatecity.in/v1/countries/${s}/states`,this.requestOpts())}catch{}}async getCities(s){try{return await this.fetchJSON(`https://api.countrystatecity.in/v1/countries/${s}/cities`,this.requestOpts())}catch{}}displayCountryDetail(s){_.innerHTML="",s.forEach(t=>{let e=`<article class="detail">
      <div class="detail__wrapper | grid gap-600">
        <figure class="detail__image">
          <img src="${t.flag}" alt="${t.flagAlt}" />
        </figure>
        <div class="detail__content | grid gap-200">
          <h2 class="detail__name | text-center">${t.name}</h2>
          <div
            class="detail__content-wrapper | flex flex-items-start flex-wrap gap-200"
          >
            <div class="grid gap-200">
              <p class="detail__txt">
                <span>Native name : </span>
                <span class="detail__native">${t.nativeName}</span>
              </p>
              <p class="detail__txt">
                <span>Population : </span>
                <span class="detail__native">${t.population}</span>
              </p>
              <p class="detail__txt">
                <span>Region : </span>
                <span class="detail__native">${t.region}</span>
              </p>
              <p class="detail__txt">
                <span>Sub Region : </span>
                <span class="detail__native">${t.subRegion}</span>
              </p>
              <p class="detail__txt">
                <span>Capital : </span>
                <span class="detail__native">${t.capital}</span>
              </p>
            </div>
            <div class="grid gap-200">
              <p class="detail__txt">
                <span>Top Level Domain : </span>
                <span class="detail__native">${t.tld}</span>
              </p>
              <p class="detail__txt">
                <span>Currencies : </span>
                <span class="detail__native">${t.currency}</span>
              </p>
              <p class="detail__txt">
                <span>Languages : </span>
                <span class="detail__native">${[...t.languages]}</span>
              </p>
              <p class="detail__txt">
                <span>Phone code : </span>
                <span class="detail__native">${t.phoneCode}</span>
              </p>
              <p class="detail__txt">
                <span>Google maps : </span>
                <a href="${t.map}" target="/blank" class="detail__native">Link 🔗</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="detail__bottom | grid gap-100">
        <div class="grid gap-200">
          <p class="detail__title | text-center">Borders</p>
          <ul
            class="detail__list detail__list--borders | flex flex-items-center gap-100"
            role="list"
          >
          ${(t.borders?t.borders:["NONE"]).map(a=>`<li class="detail__list-item">${a}</li>`).join(" ")}
          </ul>
        </div>
        <div class="grid gap-200">
          <p class="detail__title | text-center">States</p>
          <ul
            class="detail__list | flex flex-items-center gap-100"
            role="list"
          >
          ${t.states.map(a=>`<li class="detail__list-item" data-state-code="${a.state_code}">${a.name}</li>`).join(" ")}
          </ul>
        </div>
        <div class="grid gap-200">
          <p class="detail__title text-center">Cities</p>
          <ul
            class="detail__list | flex flex-items-center gap-100"
            role="list"
          >
          ${t.cities.map(a=>`<li class="detail__list-item">${a.name}</li>`).join(" ")}
          </ul>
        </div>
      </div>
    </article>`;_.insertAdjacentHTML("beforeend",e)})}addEvents(){S.addEventListener("click",this.toggleTheme),document.addEventListener("DOMContentLoaded",this.onDOMLoad.bind(this)),new IntersectionObserver(this.observerFun,{threshold:.8}).observe(g),this.getCountry("region","asia"),$.addEventListener("submit",t=>{t.preventDefault();const e=w.value.toLowerCase();this.getCountry("name",e,!1)}),d.addEventListener("click",this.toggleFilter.bind(this)),E.addEventListener("click",this.filterCountry.bind(this)),document.body.addEventListener("click",t=>{t.target.closest(".search__filter")||d.classList.remove("active")}),l.addEventListener("click",this.getCountryDetails.bind(this)),O.addEventListener("click",t=>{h.classList.remove("display-none"),f.classList.add("display-none"),this.displayError(y,"Loading details... Please wait! will you?")})}}new k;
