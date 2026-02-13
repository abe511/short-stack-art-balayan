
// theMealDB API
const API_KEY = "1";
const URL = "https://www.themealdb.com/api/json/v1/";
const IMAGES = "https://www.themealdb.com/images/ingredients/";
const API = `${URL}${API_KEY}/`;
let DATA = "";
let KEY = "";
let ENCRYPTED = "";
let DECRYPTED = "";


// show or hide loader spinner
const toggleLoader = () => {
    const loader = document.querySelector(".loader");
    loader.classList.toggle("hide");
};

// insert response values into corresponding dropdown menu
// according to the list type selected 
const populateList = (dropdown, data, list) => {
    let item = "";

    if (list === "category") item = "strCategory";
    else if (list === "area") item = "strArea";
    else if (list === "ingredient") item = "strIngredient";
    // insert option elements with contents of the response
    data.meals.forEach((el) => 
    {
        let option = document.createElement("option");
        option.text = el[item];
        option.value = el[item];
        dropdown.appendChild(option);
    });
};

// request the data to populate the dropdown menus
const getList = (list) => {
    // url is a combination of:
    // api endpoint, first letter of the list
    let url = `${API}list.php?${list[0]}=list`;

    // get the activated menu element
    const dropdown = document.querySelector(`#${list}`);
    const request = new Request(url, {
            headers: {
                credentials: "omit",
                mode: "no-cors"
                
            }
        }
    );

    // show the loader spinner
    toggleLoader();

    // insert a 'loading' option as default
    let loadingOption = document.createElement("option");
    loadingOption.text = "Loading...";
    loadingOption.setAttribute("selected", true);
    loadingOption.setAttribute("disabled", true);
    loadingOption.setAttribute("hidden", true);
    // reset the menu
    dropdown.length = 0;
    dropdown.appendChild(loadingOption);
    
    // request the data on first menu click
    // fetch(request)
    fetch(url)
    .then((response) => {
        return response.json();
    }).then((data) => {
        dropdown.length = 0;
        // deactivate 'onclick' event handler
        dropdown.removeAttribute("onclick");
        populateList(dropdown, data, list);
    }).catch((err) => {
        dropdown.length = 0;
        loadingOption.text = "Loading failed";
        dropdown.appendChild(loadingOption);
    }).finally(() => {
        // hide the loader spinner
        toggleLoader();
    });

};

function closeModal(e){
    const modal = document.querySelector("#modal");
    if (e.target.matches("#modal") ||
        e.target.matches("#close")) {
        modal.innerHTML = "";
        document.onclick = "";
        modal.classList.add("hide");
    }
};

// section with dish details
const createCard = (data, modal) => {
    
    const thumbnails = [];
    const ingredients = [];
    const measure = [];
    const tags = [];

    const close = document.createElement("button");
    const name = document.createElement("p");
    const id = document.createElement("p");
    const category = document.createElement("p");
    const area = document.createElement("p");
    const image = document.createElement("img");
    const instructions = document.createElement("p");
    const source = document.createElement("a");
    const video = document.createElement("a");
    const card = document.createElement("div");

    // fill in the elements
    close.innerText = "X";
    close.onclick = closeModal;
    close.id = "close";
    name.innerText = data.strMeal || "";
    id.innerText = "ID:" + data.idMeal || "";
    category.innerText = data.strCategory || "";
    area.innerText = data.strArea || "";
    image.src = data.strMealThumb || "";
    image.alt = data.strMeal || "";
    instructions.innerText = data.strInstructions || "";
    source.href = data.strSource || "";
    source.innerText = "Recipe";
    source.id = "source";
    video.href = data.strYoutube || "";
    video.innerText = "Watch on Youtube";
    video.id = "video";
    card.className = ("meal card");

    // check for valid properties and append them to corresponding arrays
    for (prop in data) {
        if(data[prop] && data[prop].trim()) {
            if (prop === "strTags") {
                // split the string with tags and append them 
                data[prop].split(",").forEach(el => tags.push(el));
            } else if (prop.startsWith("strIngredient")) {
                // append ingredients and urls for ingredient images
                thumbnails.push(`${IMAGES}${data[prop]}.png`);
                ingredients.push(data[prop]);
            } else if (prop.startsWith("strMeasure"))
                measure.push(data[prop]);
        }
    }

    card.appendChild(close);
    card.appendChild(name);
    card.appendChild(id);
    card.appendChild(category);
    card.appendChild(area);
    card.appendChild(image);
    card.appendChild(instructions);
    
    ingredients.forEach((el, idx) => {
        const div = document.createElement("div");
        const thumbnail = document.createElement("img");
        const ingredient = document.createElement("span");
        const dose = document.createElement("span");
        
        thumbnail.src = thumbnails[idx];
        thumbnail.alt = el;
        ingredient.innerText = el;
        dose.innerText = measure[idx];
        div.appendChild(thumbnail);
        div.appendChild(ingredient);
        div.appendChild(dose);
        card.appendChild(div);
    });

    if (tags) {
        tags.forEach((el) => {
            if(el !== "") {
                let tag = document.createElement("span");
                let link = document.createElement("a");
                tag.innerText = el;
                tag.className = "tag";
                link.appendChild(tag);
                card.appendChild(link);
            }
        });
    }
    
    card.appendChild(source);
    card.appendChild(video);
    modal.appendChild(card);

    return modal;
};


const view = (id) => {
    document.addEventListener("click", closeModal);
    // document.onclick = closeModal;
    // document.addAttribute("onclick", closeModal);
    const modal = document.querySelector(`#modal`);
    const url = `${API}lookup.php?i=${id}`;

    const request = new Request(url, {
            headers: {
                credentials: "omit",
                mode: "no-cors"
            }
        }
    );

    toggleLoader();

    // fetch(request)
    fetch(url)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        createCard(data.meals[0], modal);
        modal.classList.remove("hide");
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => {
        toggleLoader();
    });
};


function viewImg(el, link) {
    el.src = link;
}

const populateSection = (list, data) => {

    const ul = document.querySelector(`#${list}-list`);
    ul.innerHTML = "";
    data.meals.forEach((el) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        const container = document.createElement("div");
        const thumbnail = document.createElement("img");
        const name = document.createElement("p");

        const img = new Image();
        img.src = el.strMealThumb + "/preview";

        item.className = "meal preview";
        link.href = "#";
        container.setAttribute("onclick", `view(${el.idMeal})`);
        name.innerText = el.strMeal;
        thumbnail.src = el.strMealThumb + "/preview";
        thumbnail.alt = el.strMeal;
        thumbnail.setAttribute("onerror", `this.src='${el.strMealThumb}'`);

        container.appendChild(thumbnail);
        container.appendChild(name);
        link.appendChild(container);
        item.appendChild(link);
        ul.appendChild(item);
    });
};


// show selected items
const filter = (list) => {

    const value = document.querySelector(`#${list}`).value;
    // url is a combination of:
    // api endpoint, first letter of the list, selected list item
    let url = `${API}filter.php?${list[0]}=${value}`;

    const request = new Request(url, {
            headers: {
                credentials: "omit",
                mode: "no-cors"
            }
        }
    );

    if (value !== "none") {
        toggleLoader();
        // fetch(request)
        fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            populateSection(list, data);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            toggleLoader();
        });
    }
};


const getElement = (selector) => {
    return document.querySelector(selector);
}

const collectData = () => {
    let values = {};
    const category = getElement("#category").value;
    const area = getElement("#area").value;
    const ingredient = getElement("#ingredient").value;
    const categoryList = getElement("#category-list").childNodes.length;
    const areaList = getElement("#area-list").childNodes.length;
    const ingredientList = getElement("#ingredient-list").childNodes.length;
    
    if (category === "none" && area === "none" && ingredient === "none")
        alert("Nothing to encrypt. Choose an option.");
    else if (!categoryList && !areaList && !ingredientList)
        alert("Nothing to encrypt. Press 'Show' to display the results.");
    else {
        let card = getElement("#modal").childNodes.length;
        card = card && getElement("#modal").childNodes[0].childNodes[1].innerText;
        values = {
            category,
            area,
            ingredient,
            card
        };
        return values;
    }
    return;
};

const encrypt = () => {
    const collected = collectData();
    if (collected) {
        DATA = JSON.stringify(collected);
        KEY = prompt("Enter encryption key:");
        if (KEY !== "") {
            ENCRYPTED = CryptoJS.AES.encrypt(DATA, KEY);
            KEY = "";
        } else
            alert("Wrong encryption key.");
    }
};

const decrypt = () => {
    let data = {};
    let decoded = "";
    KEY = prompt("Enter encryption key:");
    if (KEY !== "") {
        DECRYPTED = CryptoJS.AES.decrypt(ENCRYPTED, KEY);
        try {
            decoded = CryptoJS.enc.Utf8.stringify(DECRYPTED);
            try {
                data = JSON.parse(decoded);
                return;
            } catch (err) {
                console.error("Wrong decryption key. JSON not parsed.");
            }
        } catch (err) {
            console.error("Wrong decryption key. UTF-8 not decoded.");
        }
    }
    alert("Wrong decryption key.");
};
