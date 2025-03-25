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
    countryInfos.classList.add("actif");
    document.querySelector("#map-holder").classList.add("infos");

    infosContent.innerHTML = `<img src="${country.flags.png}"></img>
                            <p>${country.name.common}</p>
                            <p>monnaie officielle : ${country.currencies[Object.keys(country.currencies)[0]].name}</p>
                            <p>capitale: ${country.capital}</p>
                            <p>langue officelle: ${Object.values(country.languages).join(', ')}</p>`
}

export const handleClickEvent = async (data) => {
    // Au click sur un pays
    // récupérer le code 3 pays

    const getCode3Country = () => {
        return data.properties.adm0_a3;
    }

    // récupérer les données du pays séléctionné
    const countriesDatas = await getCountries();
    const selectedCountry = countriesDatas.filter((pays) => {
        if (pays.cca3 === data.properties.adm0_a3) {
            return true;
        }
        return false;
    });

    // récupérer le code 3 devise
    const getCode3Devise = () => {
        return Object.keys(selectedCountry[0].currencies)[0];
    }

    // Affiche la carte infos
    displayCountryInfos(selectedCountry[0]);

    // met à jour le converter avec la première devise
    updateConverter(1, data.properties.adm0_a3);

    ///////////////////////////////////////////////////////////////////////
    
    return [getCode3Country(), getCode3Devise()];
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