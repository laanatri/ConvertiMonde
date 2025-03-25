import { choiceCountries } from "./select_country.js";

const converter = document.querySelector(".convert-container")
const input1 = document.querySelector("#input1");
const input2 = document.querySelector('#input2');
const listDevises = document.querySelectorAll('.converter select');
let optionsList1 = document.querySelectorAll("#devise-select-1 option");
let optionsList2 = document.querySelectorAll("#devise-select-1 option");
const button = document.querySelector('.converter button');

const initConverter = (countries) => {
    // le param datas = json
    let devises = [];
    let go = true;
    countries.forEach(country => {
        devises.push([country.codeDevise, country.devise])
    })

    // tri
    devises.sort((a, b) => a[1].localeCompare(b[1]));

    devises = devises.reduce((acc, devise) => {
        if (!acc.some(d => d[0] === devise[0])) {
            acc.push(devise);
        }
        return acc;
    }, []);

    // ajout des devises dans les listes
    listDevises.forEach((d) => {
        devises.forEach(dev => {
            const devise = document.createElement("option");
            devise.value = dev[0];
            devise.innerText = dev[1];
            d.append(devise);
        })
    })
}

export const handleDisplayConverter = (b) => {
    if (b) {
        converter.classList.remove("hidden");
    } else {
        converter.classList.add("hidden");
    }
}

export const updateConverter = (index, value) => {
    const theCountry = choiceCountries.find((country) => {
        return country.codecountry === value
    })
    if (index === 0) {
        document.querySelector(`#devise-select-1 option[value="${theCountry.codeDevise}"`).selected = true;
    } else {
        document.querySelector(`#devise-select-2 option[value="${theCountry.codeDevise}"`).selected = true;
    }
}

const handleConvertion = async (value1, value2, amount) => {
    const response = await fetch(`https://currency-converter5.p.rapidapi.com/currency/convert?format=json&from=${value1}&to=${value2}&amount=${amount}&language=en`, {
    // const response = await fetch(`https://currency-converter5.p.rapidapi.com/currency/list?format=json&language=en`, {
        method: 'GET',
        headers: {
            "x-rapidapi-host": "currency-converter5.p.rapidapi.com",
            "X-RapidAPI-Key": "fdd941d410mshbe33753e9e54de5p1108d7jsnda26b69261c4"
        }
    })
    return await response.json();
}

button.addEventListener("click", async () => {
    if (input1.value && listDevises[0].value && listDevises[1].value) {
        const datas = await handleConvertion(listDevises[0].value, listDevises[1].value, input1.value);
        input2.value =  Number.parseFloat(datas.rates[Object.keys(datas.rates)].rate_for_amount).toFixed(2);
    }
})

setTimeout(async () => {
    initConverter(choiceCountries);
    optionsList1 = document.querySelectorAll("#devise-select-1 option");
    optionsList2 = document.querySelectorAll("#devise-select-1 option");
}, 5000)