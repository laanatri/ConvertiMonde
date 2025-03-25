import { choiceCountries } from "./select_country.js";
import { updateConverter } from "./devises.js";

const choice = document.querySelector(".current-country>div:first-child");
const listChoice = document.querySelector(".all-flags-content");

const updateChangeCountry = async (curentCountry, countries) => {
    const country = await countries.find(country => country.codecountry === curentCountry);

    choice.innerHTML = `<div class="country" data-country="${country.codecountry}">
                            <div class="flag-content">
                                <img loading="lazy" src="${country.flagUrl}" alt="">
                            </div>
                            <div class="code-content">
                                <p>${country.codecountry}</p>
                            </div>
                        </div>`;

                        
        // met à jour le converter avec la première devise

        // console.log(country.codecountry)
        updateConverter(0, country.codecountry);
        /////////////////////////////////////////////////////////////////////////////////////

    }

export const initChangeCountry = (curentCountry, countries) => {
    // console.log(countries)
    // console.log(curentCountry)
    const country = countries.find(country => country.codecountry === curentCountry)
    // console.log(country)

    choice.innerHTML = `<div class="country" data-country="${country.codecountry}">
                            <div class="flag-content">
                                <img loading="lazy" src="${country.flagUrl}" alt="">
                            </div>
                            <div class="code-content">
                                <p>${country.codecountry}</p>
                            </div>
                        </div>`;

    for (const country of countries) {
        listChoice.innerHTML += `<div class="country" data-country="${country.codecountry}">
                                    <div class="flag-content">
                                        <img loading="lazy" src="${country.flagUrl}" alt="">
                                    </div>
                                    <div class="code-content">
                                        <p>${country.codecountry}</p>
                                    </div>
                                </div>`;
    }

    document.querySelectorAll(".all-flags-content .country").forEach(country => {
        country.addEventListener("click", async () => {
            await updateChangeCountry(country.dataset.country, choiceCountries)
            choice.click();
        })
    })
    
}

choice.addEventListener("click", () => {
    listChoice.classList.toggle("active");
})