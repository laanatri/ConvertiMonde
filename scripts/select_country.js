import { handleDisplayConverter, updateConverter } from "./devises.js";

const infosContent = document.querySelector(".selected-country-infos .infos-content");
const countryInfos = document.querySelector(".selected-country-infos");

const getCountries = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all");
    return await response.json();
}

export const restCountriesDatas = await getCountries();
const allCountriesUse = [];

const getAllCountriesUse = async () => {
    const countries = await getCountries();
    countries.forEach(country => {
        allCountriesUse.push({
            name: country.name.common,
            codecountry: country.cca3,
            flagUrl: country.flags.svg,
            devise: country.currencies ? country.currencies[Object.keys(country.currencies)[0]].name : "no devise",
            codeDevise: country.currencies ? Object.keys(country.currencies)[0] : "no code devise"
        });
    });
    return allCountriesUse.sort((a, b) => a.name.localeCompare(b.name));
}

export const choiceCountries = await getAllCountriesUse();

const displayCountryInfos = (country) => {
    countryInfos.classList.remove("actif");
    document.querySelector("#map-holder").classList.remove("infos");
    setTimeout(() => {
        countryInfos.classList.add("actif");
        document.querySelector("#map-holder").classList.add("infos");
        infosContent.innerHTML = `<img src="${country.flags.png}"></img>
                                <p>${country.name.common}</p>
                                <p>monnaie officielle : <span>${country.currencies[Object.keys(country.currencies)[0]].name}</span></p>
                                <p>capitale : <span>${country.capital}</span></p>
                                <p>langue officelle : <span>${Object.values(country.languages).join(', ')}</span></p>`;
    }, 400)
}

export const handleClickEvent = async (data) => {
    // récupérer les données du pays séléctionné
    const countriesDatas = await getCountries();
    const selectedCountry = countriesDatas.filter((pays) => {
        if (pays.cca3 === data.properties.adm0_a3) {
            return true;
        }
        return false;
    });

    // Affiche la carte infos
    displayCountryInfos(selectedCountry[0]);

    // met à jour le converter avec la première devise
    updateConverter(1, data.properties.adm0_a3);
}

// Display le converter
document.querySelector(".convert-btn button").addEventListener("click", () => {
    handleDisplayConverter(true);
})

// close infos pays
document.querySelector(".selected-country-infos .close-btn").addEventListener("click", () => {
    document.querySelector(".selected-country-infos").classList.remove("actif");
    document.querySelector("#map-holder").classList.remove("infos");
})