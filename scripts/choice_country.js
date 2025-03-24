import { getAllCountriesNames } from "./select_country.js";

const choiceCountries = await getAllCountriesNames()
const countrySelect = document.getElementById("country")
const nextButton = document.getElementById('next-button')


// console.log(await getAllCountriesNames())

// let option;

getAllCountriesNames().then(choiceCountries => {

    countrySelect.innerHTML = ''
    const options = []; 
    // Créer un objet Set pour stocker les noms uniques des pays
    const uniqueNames = new Set();

    Object.entries(choiceCountries).forEach(country => {

        if (!uniqueNames.has(country[1])) {
            uniqueNames.add(country[1]);


      // Créer un nouvel élément option pour un menu déroulant 
        const option = document.createElement("option");
        option.innerText = country[1] //Définit le texte visible de l'option comme étant le nom du pays
        option.value = country[0] // Pareil mais pour le code du pays
        options.push(option)
        }
    })
    
    // Trie les options par ordre alphabétique des noms de pays
    // Utilise la méthode localeCompare pour un tri adapté à la langue française
    options.sort((a, b) => a.innerText.localeCompare(b.innerText, 'fr', {sensitivity: 'base'}))
    
    // Parcourt toutes les options triées
    options.forEach(option => {
        // Ajoute chaque option au menu déroulant (countrySelect est un élément select défini ailleurs)
        countrySelect.add(option); 
        console.log("country", country)
    })
    
})

nextButton.addEventListener("click", () => {

})