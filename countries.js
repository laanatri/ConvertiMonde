const getCountries = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all");
    return await response.json();
}

export const handleClickEvent = async (data) => {
    // Au click sur un pays
    // récupérer le code 3 pays
    const code3Country = data.properties.adm0_a3;
    console.log("pays : " + code3Country);

    // récupérer les données du pays séléctionné
    const countriesDatas = await getCountries();
    const selectedCountry = countriesDatas.filter((pays) => {
        if (pays.cca3 === code3Country) {
            return true;
        }
        return false;
    });
    console.log(selectedCountry);

    // monaie code 3
    const code3Devise = Object.keys(selectedCountry[0].currencies)[0];
    console.log(code3Devise);




    // Set le convertisseur avec les monaies (monaie fr plus la monaie du pays choisi)
}
