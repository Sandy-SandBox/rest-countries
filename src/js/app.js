const themeSwitcher = document.querySelector(".theme-switcher");
const rootEl = document.documentElement;
const mainArea = document.querySelector("main");
const countryContainer = document.querySelector(".countries");
const detailContainer = document.querySelector(".detail-container");
const inputSearch = document.querySelector("#search");
const form = document.querySelector("form");
const container = document.querySelector(".main-area");
const detailArea = document.querySelector(".detail-area");
const filter = document.querySelector(".search__filter");
const filterDropdown = document.querySelector(".search__filter-dropdown");
const suggestionEl = document.querySelector(".search__suggestion");
const btnSortPopulation = document.querySelector(".btn-sort");
const btnBack = document.querySelector(".btn-back");
const dynamicTxt = document.querySelector(".dynamic-txt");
let sortByOrder = "lowest";
let countryNames = [];
class App {
  constructor() {
    this.addEvents();
  }
  // When document loads
  async onDOMLoad() {
    let localTheme = localStorage.getItem("theme");
    let themeToSet = localTheme;
    if (!localTheme) {
      themeToSet = window.matchMedia("(prefers-color-scheme : dark").matches
        ? "dark"
        : "light";
    }
    rootEl.setAttribute("data-theme", themeToSet);
    // this.getCountry("region", "asia");
  }
  // Toggle dark mode
  toggleTheme() {
    let theme = rootEl.getAttribute("data-theme"),
      newTheme;
    newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    rootEl.setAttribute("data-theme", newTheme);
  }
  // IntersectionObserver
  observerFun(entries, observer) {
    entries.forEach((entry) => {
      mainArea.classList.toggle("active", entry.isIntersecting);
    });
  }
  // Fetch apis
  async fetchJSON(url, options) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching JSON:", error.message);
      throw error;
    }
  }
  // Timeout
  timeout(sec) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("timeout"));
      }, sec * 1000);
    });
  }
  requestOpts() {
    const headers = new Headers();
    headers.append(
      "X-CSCAPI-KEY",
      "R2JEWjN5SjA1akRsNWx3U21jeVJvbHYwdTlsdzhudEdYdWRiUllBSQ=="
    );
    const requestOptions = {
      method: "GET",
      headers: headers,
      redirect: "follow",
    };
    return requestOptions;
  }
  async getCountryData(country, countryCode) {
    try {
      const [countryStateCityData, restCountryData] = await Promise.all([
        this.fetchJSON(
          `https://api.countrystatecity.in/v1/countries/${countryCode}`,
          this.requestOpts()
        ),
        this.fetchJSON(`https://restcountries.com/v3.1/name/${country}`),
      ]);
      return [countryStateCityData, restCountryData];
    } catch (err) {}
  }
  // Get countries
  async getCountry(getBy, getByValue, isByRegion = true) {
    try {
      isByRegion
        ? (countryContainer.innerHTML = this.generateSkelton(3))
        : (countryContainer.innerHTML = this.generateSkelton(1));
      const countries = await Promise.race([
        this.fetchJSON(`https://restcountries.com/v3.1/${getBy}/${getByValue}`),
        this.timeout(3),
      ]);
      const singleCountry = countries.filter(
        (country) =>
          country.altSpellings.includes(getByValue.toUpperCase()) ||
          country.name.common.toLowerCase().includes(getByValue)
      );
      if (isByRegion) {
        this.displayCountries(this.sortCountries(countries, "region"));
      } else {
        if (singleCountry.length > 0) {
          btnSortPopulation.classList.add("display-none");
          this.displayCountries(singleCountry);
        } else this.displayError(countryContainer, `Country not found 🌎❓`);
      }
      // Sort the results
      btnSortPopulation.addEventListener("click", (e) => {
        this.displayCountries(this.sortCountries(countries, "population"));
      });

      countries.forEach((country) =>
        countryNames.push(country.name.common.toLowerCase())
      );
    } catch (err) {
      console.error(err);
      if (err.message === "timeout") {
        this.displayError(countryContainer, `Request time out ⌚. Try again!`);
      } else {
        this.displayError(
          countryContainer,
          `Country not found. ${err.message} 🌎❓`
        );
      }
    }
  }
  // Sort countries
  sortCountries(countries, sortBy = "region") {
    btnSortPopulation.classList.remove("display-none");
    if (sortBy === "region") {
      return countries.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );
    }
    if (sortBy === "population") {
      // Toggle between "highest" and "lowest"
      sortByOrder = sortByOrder === "lowest" ? "highest" : "lowest";
      // Sort based on the toggle state
      if (sortByOrder === "highest") {
        btnSortPopulation.textContent = `Sort by lowest population`;
        return countries.sort((a, b) => b.population - a.population);
      } else {
        btnSortPopulation.textContent = `Sort by highest population`;
        return countries.sort((a, b) => a.population - b.population);
      }
    }
  }
  // Toggle filter button
  toggleFilter(e) {
    filter.classList.toggle("active");
  }
  // Filter by reigon
  filterCountry(e) {
    if (e.target.classList.contains(".search__filter-item")) return;
    const region = e.target.textContent.toLowerCase().trim();
    const regionTxt = filter.querySelector(".search__filter-btn span");
    const regions = document.querySelectorAll(".search__filter-item");
    this.getCountry("region", region, true);
    regionTxt.textContent = region;
    regions.forEach((reg) =>
      reg.classList.remove("search__filter-item--selected")
    );
    e.target.classList.add("search__filter-item--selected");
  }
  // Display countries
  displayCountries(data) {
    countryContainer.innerHTML = "";
    // Ensure data is always an array
    const dataArray = Array.isArray(data) ? data : [data];
    dataArray.forEach((country) => {
      const countryHTML = `<article class="country">
      <figure class="country__image">
        <img src="${country?.flags.svg}" alt="${
        country.flags.alt !== undefined
          ? country.flags.alt
          : country.name.common + "'s flag"
      }" />
      </figure>
      <div
        class="country__content | flex flex-justify-center flex-column gap-100"
      >
        <p class="country__txt">
          <span>Name :</span> <span class="country__name">${
            country.name.common
          }</span>
        </p>
        <p class="country__txt">
          <span>Population :</span>
          <span class="country__population">${country.population}</span>
        </p>
        <p class="country__txt">
          <span>Region :</span>
          <span class="country__region">${country.region}</span>
        </p>
        <p class="country__txt">
          <span>Capital :</span>
          <span class="country__capital">${
            country.capital || "Not found"
          }</span>
        </p>
      </div>
      <button class="btn btn--default country__btn" data-country-code="${
        country.cca2
      }" data-country-name="${country.name.common}">Details</button>
    </article>`;
      countryContainer.insertAdjacentHTML("beforeend", countryHTML);
    });
  }
  // Generate skeltons
  generateSkelton(repeatCount) {
    countryContainer.innerHTML = "";
    const skelton = `<article class="skelton">
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
     </article>`;
    return skelton.repeat(repeatCount);
  }
  displayError(parentEl, msg) {
    const p = document.createElement("p");
    p.classList.add("error");
    p.textContent = msg;
    parentEl.innerHTML = "";
    parentEl.insertAdjacentElement("beforeend", p);
  }
  // Get details of a country
  async getCountryDetails(e) {
    if (!e.target.classList.contains("country__btn")) return;
    const detailBtn = e.target;
    const country = detailBtn.dataset.countryName;
    const countryCode = detailBtn.dataset.countryCode;
    container.classList.add("display-none");
    detailArea.classList.remove("display-none");
    try {
      let [countryStateCityData, restCountryData] = await this.getCountryData(
        country,
        countryCode
      );
      [restCountryData] = restCountryData.filter(
        (restCountry) =>
          restCountry.name.common.toLowerCase() === country.toLowerCase()
      );
      const statesData = (await this.getStates(countryCode)) || ["NONE"];
      const citiesData = (await this.getCities(countryCode)) || ["NONE"];
      const countryLngs = [Object.values(restCountryData.languages)];

      const countryData = [
        {
          name: countryStateCityData.name,
          nativeName: countryStateCityData.native,
          region: countryStateCityData.region,
          subRegion: countryStateCityData.subregion,
          capital: countryStateCityData.capital,
          tld: countryStateCityData.tld,
          phoneCode: countryStateCityData.phonecode,
          currency: countryStateCityData.currency_name,
          population: restCountryData.population,
          languages: countryLngs,
          flag: restCountryData.flags?.svg,
          flagAlt: restCountryData.flags?.alt,
          nationality: countryStateCityData.nationality,
          borders: restCountryData?.borders,
          states: statesData,
          cities: citiesData,
          map: restCountryData.maps.googleMaps,
        },
      ];
      this.displayCountryDetail(countryData);
      console.log(countryData);
    } catch (err) {
      this.displayError(dynamicTxt, `Failed to get details. 🌎❓`);
    }
  }
  async getStates(code) {
    try {
      const states = await this.fetchJSON(
        `https://api.countrystatecity.in/v1/countries/${code}/states`,
        this.requestOpts()
      );
      return states;
    } catch (err) {}
  }
  async getCities(code) {
    try {
      const cities = await this.fetchJSON(
        `https://api.countrystatecity.in/v1/countries/${code}/cities`,
        this.requestOpts()
      );
      return cities;
    } catch (err) {}
  }
  displayCountryDetail(countryData) {
    detailContainer.innerHTML = "";
    countryData.forEach((country) => {
      let detailHTML = `<article class="detail">
      <div class="detail__wrapper | grid gap-600">
        <figure class="detail__image">
          <img src="${country.flag}" alt="${country.flagAlt}" />
        </figure>
        <div class="detail__content | grid gap-200">
          <h2 class="detail__name | text-center">${country.name}</h2>
          <div
            class="detail__content-wrapper | flex flex-items-start flex-wrap gap-200"
          >
            <div class="grid gap-200">
              <p class="detail__txt">
                <span>Native name : </span>
                <span class="detail__native">${country.nativeName}</span>
              </p>
              <p class="detail__txt">
                <span>Population : </span>
                <span class="detail__native">${country.population}</span>
              </p>
              <p class="detail__txt">
                <span>Region : </span>
                <span class="detail__native">${country.region}</span>
              </p>
              <p class="detail__txt">
                <span>Sub Region : </span>
                <span class="detail__native">${country.subRegion}</span>
              </p>
              <p class="detail__txt">
                <span>Capital : </span>
                <span class="detail__native">${country.capital}</span>
              </p>
            </div>
            <div class="grid gap-200">
              <p class="detail__txt">
                <span>Top Level Domain : </span>
                <span class="detail__native">${country.tld}</span>
              </p>
              <p class="detail__txt">
                <span>Currencies : </span>
                <span class="detail__native">${country.currency}</span>
              </p>
              <p class="detail__txt">
                <span>Languages : </span>
                <span class="detail__native">${[...country.languages]}</span>
              </p>
              <p class="detail__txt">
                <span>Phone code : </span>
                <span class="detail__native">${country.phoneCode}</span>
              </p>
              <p class="detail__txt">
                <span>Google maps : </span>
                <a href="${
                  country.map
                }" target="/blank" class="detail__native">Link 🔗</a>
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
          ${(country.borders ? country.borders : ["NONE"])
            .map((border) => `<li class="detail__list-item">${border}</li>`)
            .join(" ")}
          </ul>
        </div>
        <div class="grid gap-200">
          <p class="detail__title | text-center">States</p>
          <ul
            class="detail__list | flex flex-items-center gap-100"
            role="list"
          >
          ${country.states
            .map(
              (state) =>
                `<li class="detail__list-item" data-state-code="${state.state_code}">${state.name}</li>`
            )
            .join(" ")}
          </ul>
        </div>
        <div class="grid gap-200">
          <p class="detail__title text-center">Cities</p>
          <ul
            class="detail__list | flex flex-items-center gap-100"
            role="list"
          >
          ${country.cities
            .map((city) => `<li class="detail__list-item">${city.name}</li>`)
            .join(" ")}
          </ul>
        </div>
      </div>
    </article>`;
      detailContainer.insertAdjacentHTML("beforeend", detailHTML);
    });
  }
  autoSuggest(e) {
    const autoSuggestionList = suggestionEl.querySelector("ul");
    let result = [];
    if (!inputSearch.value.length > 0) {
      const region = filter
        .querySelector(".search__filter-item--selected")
        .textContent.toLowerCase()
        .trim();
      autoSuggestionList.innerHTML = "";
      suggestionEl.classList.remove("active");
      this.getCountry("region", region);
      return;
    }
    suggestionEl.classList.add("active");
    result = countryNames.filter((countryName) => {
      return countryName
        .toLowerCase()
        .includes(inputSearch.value.toLowerCase());
    });
    let html = "";
    Array.from(new Set(result)).map((name) => {
      html += `<li class="search__suggestion-item">${name}</li>`;
      autoSuggestionList.innerHTML = html;
    });
    const suggestedCountry = document.querySelectorAll(
      ".search__suggestion-item"
    );

    autoSuggestionList.addEventListener("click", (e) => {
      if (!e.target.classList.contains("search__suggestion-item")) return;
      const clickedCountry = e.target.textContent;
      inputSearch.value = clickedCountry;
      suggestionEl.classList.remove("active");
      this.getCountry("name", clickedCountry, false);
    });
  }
  // Add event listeners
  addEvents() {
    themeSwitcher.addEventListener("click", this.toggleTheme);
    document.addEventListener("DOMContentLoaded", this.onDOMLoad.bind(this));
    const observer = new IntersectionObserver(this.observerFun, {
      threshold: 0.8,
    });
    observer.observe(mainArea);
    this.getCountry("region", "asia");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const searchVal = inputSearch.value;
      this.getCountry("name", searchVal, false);
    });
    filter.addEventListener("click", this.toggleFilter.bind(this));
    filterDropdown.addEventListener("click", this.filterCountry.bind(this));
    document.body.addEventListener("click", (e) => {
      if (!e.target.closest(".search__filter"))
        filter.classList.remove("active");
    });
    countryContainer.addEventListener(
      "click",
      this.getCountryDetails.bind(this)
    );
    btnBack.addEventListener("click", (e) => {
      container.classList.remove("display-none");
      detailArea.classList.add("display-none");
      this.displayError(
        dynamicTxt,
        "Loading details... Please wait! will you?"
      );
    });
    inputSearch.addEventListener("keyup", this.autoSuggest.bind(this));
  }
}
const app = new App();
