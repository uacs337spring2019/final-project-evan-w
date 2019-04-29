x/*
    Evan Westman
    CSC 337
    HW 11
    4/24/2019

    Client-side JS for the recipe blog.
*/

"use strict";

/**
 *   Onload wrapper function. Contains first GET request.
 */
window.onload = function() {

    checkElements();

    document.getElementById('searchbox').style.display = 'block';
    document.getElementById('subtext').innerHTML = 'Search for a recipe:';
    document.getElementById('defaultbutton').checked = true;

    // Handling when go button is clicked
    document.getElementById('go').onclick = function() {

        checkElements();

        let keyword = document.getElementById('keyword').value;
        let e = document.getElementById('rating');
        let rating = e.options[e.selectedIndex].value;
        let diet = document.querySelector('input[name="diet"]:checked').value;

        

        let url = "http://blog.herokuapp.com:process.env.PORT/?mode=search&keyword=" + 
                    keyword + "&rating=" + rating + "&diet=" + diet;

        // Fetch from the server
        fetch(url)
            .then(checkStatus)
            .then(function(responseText) {
                console.log(responseText);
    
                let results = document.getElementById('results');

                //  Check if the recipe results already exist on the page
                if (results != null) {
                    results.remove();
                }

                // If no recipes found display error message
                if (responseText == '') {
                    document.getElementById('subtext').innerText = 'No recipes found.';
                    return;
                }
                // Convert response to JSON object
                let recipes = JSON.parse(responseText);
    
                // Update subtext on page
                document.getElementById('subtext').innerText = 'Results:';


                updateDOM(recipes);
                //console.log(recipes);

                let desc = document.getElementsByClassName('descLink');

                for (let i = 0; i < desc.length; i++) {
                    desc[i].addEventListener('click', linkClick);
                }

            })
            .catch(function(error) {
                console.log(error);
            });
    };

};

/**
 *   Checks for and removes DOM that needs handling for  onclicks
 */
function checkElements() {
    let table = document.getElementById('recipeTable');

    // Check if DOM objects already exist on page and 
    // remove if necessary:

    if (table != null) {
        table.remove();
    }

    let recipeTitle = document.getElementById('recipeTitle');

    if (recipeTitle != null) {
        recipeTitle.remove();
    }

    let recipeImg = document.getElementById('recipeImg');

    if (recipeImg != null) {
        recipeImg.remove();
    }

    let ingr = document.getElementById('ingredients');

    if (ingr != null) {
        ingr.remove();
    }

    let steps = document.getElementById('steps');

    if (steps != null) {
        steps.remove();
    }
}


/**
 *   Loads recipe when link is clicked on. Contains second GET request
 */
function linkClick(event) {
    let recipe = event.target.innerText.toLowerCase().split(' ').join('');
    let url = "http://blog.herokuapp.com:process.env.PORT/?mode=desc&recipe=" + recipe;

    // Creating back button
    let back = document.createElement('button');
    document.body.appendChild(back);
    back.innerText = 'Back';
    back.setAttribute('id', 'back');

    // Back button click handler
    back.onclick = function(){

        checkElements();

        back.remove();
        document.getElementById('searchbox').style.display = 'block';
        document.getElementById('subtext').innerHTML = 'Search for a recipe:';
    };

    // GET request to load recipe details page
    fetch(url)
        .then(checkStatus)
        .then(function(responseText) {
            console.log("test");

            let response = JSON.parse(responseText);

            // Hiding un-needed DOM
            document.getElementById('recipeTable').style.display = 'none';
            document.getElementById('searchbox').style.display = 'none';
            document.getElementById('subtext').innerHTML = '';

            // Adding recipe  title
            let descTitle = document.createElement('h1');
            descTitle.setAttribute('id', 'recipeTitle');
            descTitle.innerText = event.target.innerText;

            // Adding recipe image
            let image = document.createElement('div');
            image.setAttribute('id', 'recipeImg');
            console.log(event.target.imgUrl);
            image.style.backgroundImage = 'url("' + recipe +  '.jpg")';

            let ingredients = document.createElement('ul');
            ingredients.setAttribute('id', 'ingredients');

            // Adding ingredients list
            for (let i = 0; i < response.ingredients.length; i++) {
                let item = document.createElement('li');
                item.innerText = response.ingredients[i];
                ingredients.appendChild(item);
            }

            let steps = document.createElement('ol');
            steps.setAttribute('id', 'steps');

            // Adding steps list
            for (let i = 0; i < response.steps.length; i++) {
                let item = document.createElement('li');
                item.innerText = response.steps[i];
                steps.appendChild(item);
            }

            // Adding everything to the body
            document.body.appendChild(descTitle);
            document.body.appendChild(image);
            document.body.appendChild(ingredients);
            document.body.appendChild(steps);
            

        })
        .catch(function(error) {
            console.log(error);
        }); 
}

/**
 *  Updates the page with movie table after search is performed.
 */
function updateDOM(recipes) {
    
    console.log(recipes);

    let table = document.createElement('table');
    table.setAttribute('id', 'recipeTable');
    let tableHeaders = document.createElement('tr');

    tableHeaders = table.insertRow();
    tableHeaders.insertCell().textContent = 'Rating';
    tableHeaders.insertCell().textContent = 'Recipe';
    tableHeaders.insertCell().textContent = 'Type';

    for (let i = 0; i < recipes.recipes.length; i++) {
        let row = table.insertRow();
        
        row.insertCell().textContent = recipes.recipes[i].rating;

        // Make the recipe name clickable and store data in tag
        let a = document.createElement('a');
        a.innerText = recipes.recipes[i].name;
        a.setAttribute('href', '#');
        a.setAttribute('class', 'descLink');
        row.insertCell().appendChild(a);

        row.insertCell().textContent = recipes.recipes[i].diet;
    }

    document.body.appendChild(table);
}

/**
 * Returns the response text if the status is in the 200s
 * otherwise rejects the promise with a message including the status.
 */
function checkStatus(response) {  
    if (response.status >= 200 && response.status < 300) {  
        return response.text();
    } else if (response.status == 404) {
    	// sends back a different error when we have a 404 than when we have
    	// a different error
    	return Promise.reject(new Error("Sorry, we couldn't find that page")); 
    } else {  
        return Promise.reject(new Error(response.status+": "+response.statusText)); 
    } 
}