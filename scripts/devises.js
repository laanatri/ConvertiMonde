const input1 = document.querySelector("#input1");
const input2 = document.querySelector('#input2');
const listDevises = document.querySelectorAll('select');
const button = document.querySelector('button');

const getCountries = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all");
    return await response.json();
}

const initConverter = (datas) => {
    // le param datas = json
    let devises = [];
    let go = true;
    datas.forEach(data => {
        if (devises[0] === undefined) {
            if (data.currencies && Object.keys(data.currencies)[0]) {
                devises.push([Object.keys(data.currencies)[0], data.currencies[Object.keys(data.currencies)[0]].name]);
            }
        } else {
            if (data.currencies && Object.keys(data.currencies)[0]) {
                devises.forEach(d => {
                    if (d[1] === data.currencies[Object.keys(data.currencies)[0]].name) {
                        go = false;
                    }
                })
                if (go) {
                    devises.push([Object.keys(data.currencies)[0], data.currencies[Object.keys(data.currencies)[0]].name]);
                }
            }
        }
        go = true;
    })
    devises.sort((a, b) => a[1].localeCompare(b[1]));
    listDevises.forEach((d) => {
        devises.forEach(dev => {
            const devise = document.createElement("option");
            devise.value = dev[0];
            devise.innerText = dev[1];
            d.append(devise);
        })
    })
}

const handleConvertion = async () => {
    // const response = await fetch(`https://currency-converter5.p.rapidapi.com/currency/convert?format=json&from=${value1}&to=${value2}&amount=${amount}&language=en`, {
        const response = await fetch(`https://currency-converter5.p.rapidapi.com/currency/list?format=json&language=en`, {
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

initConverter(await getCountries());

const lala = async () => {
    const response = await fetch("./svg.json");
    const jsonDatas = await response.json();
    // console.log(jsonDatas);
}

lala();


console.log( await handleConvertion())

// value1, value2, amount