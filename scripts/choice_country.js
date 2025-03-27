import { choiceCountries } from "./select_country.js";
import { initChangeCountry } from "./change_current_country.js";
import { updateConverter } from "./devises.js";

// export const choiceCountries = await getAllCountriesUse();
const choiceCountryContainer = document.querySelector(".choice-country-container");
const countrySelect = document.getElementById("country-select");
const nextButton = document.getElementById('next-button');
const changeCountry = document.querySelector('.current-country');
const loader = document.querySelector('.loader-container');

window.addEventListener("load", () => {
    choiceCountryContainer.classList.remove("hidden");
    loader.classList.add("hidden");
    document.querySelectorAll(".choice-country-container .choice-country>*").forEach((element, i) => element.style.transitionDelay = ((i * .1) + 1) + "s");
})

setTimeout(() => {
    loader.classList.add("hidden");
    choiceCountryContainer.classList.remove("hidden");
    document.querySelectorAll(".choice-country-container .choice-country>*").forEach((element, i) => element.style.transitionDelay = ((i * .1) + 1) + "s");
}, 3000)

// First choice
const initAskCountry = (countries) => {
    // créer toute la liste de nom de pays à partir de choiceCountries (tableau de pays)
    countries.forEach(country => {
        countrySelect.innerHTML += `<option value="${country.codecountry}">${country.name}</option>`;
    });

    //peut avoir à partir de la window pour mettre en valeur par default ??

    // Ajout Event click sur le bouton pour enrgistrer le pays choisi
    nextButton.addEventListener("click", () => {
        event.preventDefault();

        // enregistre le pays
        let selectedCountry = countrySelect.value;

        // init l'onglet de changement de pays
        initChangeCountry(selectedCountry, choiceCountries);
        changeCountry.classList.add("active");
        
        // cache le form
        hideAskCountry();


        // met à jour le converter avec la première devise

        // console.log(selectedCountry)
        updateConverter(0, selectedCountry);
        /////////////////////////////////////////////////////////////////////////////////////

    })
}

// Caché la div du form de choix du pays
const hideAskCountry = () => {
    choiceCountryContainer.style.opacity = 0;
    choiceCountryContainer.style.visibility = "hidden";
}

// Init de la liste déroulante
initAskCountry(choiceCountries);