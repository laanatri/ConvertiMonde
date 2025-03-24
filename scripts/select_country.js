const getCountries = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all");
    return await response.json();
}

const allCountriesNames = [];

export const getAllCountriesNames = async () => {
    const countries = await getCountries();
    countries.forEach(pays => {
        allCountriesNames.push(pays.name.common);
    });
    return allCountriesNames;
}

export const handleClickEvent = async (data) => {
    // Au click sur un pays
    // récupérer le code 3 pays
    const code3Country = data.properties.adm0_a3;

    // récupérer les données du pays séléctionné
    const countriesDatas = await getCountries();
    const selectedCountry = countriesDatas.filter((pays) => {
        if (pays.cca3 === code3Country) {
            return true;
        }
        return false;
    });

    // récupérer le code 3 devise
    const code3Devise = Object.keys(selectedCountry[0].currencies)[0];

    // Affiche la carte infos
    const countryInfos = document.querySelector(".selected-country-infos");
    countryInfos.classList.add("actif");
    document.querySelector("#map-holder").classList.add("infos");

    // rempli la carte infos
    const infosContent = document.querySelector(".selected-country-infos .infos-content");

    ///////////////////////////////////////////////////////////////////////////////
    infosContent.innerHTML = `<p>${selectedCountry[0].name.common}</p>
                          
                            <p>monnaie officielle : ${selectedCountry[0].currencies[Object.keys(selectedCountry[0].currencies)[0]].name}</p>
                            <p>capitale: ${selectedCountry[0].capital}</p>
                            <p>langue officelle: ${selectedCountry[0].languages[Object.keys(selectedCountry[0].languages)[0]]}</p>
                            
                            <br>
                            <img src="${selectedCountry[0].flags.png}"></img> 
    `
    ///////////////////////////////////////////////////////////////////////////////

}

document.querySelector(".selected-country-infos .close-btn").addEventListener("click", () => {
    document.querySelector(".selected-country-infos").classList.remove("actif")
    document.querySelector("#map-holder").classList.remove("infos")
})





{/* <h2 id="un">nom du pays: ${data[i].name.common}</h2>
<p>monnaie officielle : ${data[i].currencies[Object.keys(data[i].currencies)[0]].name}</p>
<p>capitale: ${data[i].capital}</p>
<p>drapeau: ${data[i].flag}</p>
<p>langue officelle: ${data[i].languages[Object.keys(data[i].languages)[0]]}</p>
<img src="${data[i].flags.png}"></img> */}