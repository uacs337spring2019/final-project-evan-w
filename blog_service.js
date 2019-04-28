/*
    Evan Westman
    CSC 337
    HW 11
    4/13/2019

    Server-side JS using node and express for the recipe blog.
*/

"use strict";

const express = require("express");
const app = express();
const fs = require('fs');

app.use(express.static('/public'));

console.log("Web service started.");

// Handle GET request from client
app.get('/', function (req, res) { 
    res.header("Access-Control-Allow-Origin", "*");
    
    
    if (req.query.mode == 'search') {
        // Get parameters
        let keyword = req.query.keyword;
        let rating = req.query.rating;
        let diet = req.query.diet;

        let fileName = 'recipes/recipes.txt';

        // Read the main recipes file
        let file = read_file(fileName);

        // Find recipes in the file based on GET params
        let recipes = find_recipes(file, keyword, rating, diet);

        if (recipes.length == 0) {
            console.log("No recipes found");
            res.send("");
        } else {
            let recipeList = '';

            // Iterate through all recipe files
            fs.readdirSync("recipes").forEach(file => {

                // Iterate through recipes returned from search
                for (let i = 0; i < recipes.length; i++) {

                    // Get rid of spaces and +s
                    let aRecipe = recipes[i].split(' ')[0].split('+').join('');

                    // Check for matches
                    if (file == aRecipe.toLowerCase()) {
                        // split info.txt by newspace chars
                        let info = read_file("recipes/" + file 
                                    + "/info.txt").toString().split(/\r?\n/);
                        let imgUrl = "recipes/" + file + "/picture.jpg";

                        // Build the JSON
                        let recipeJSON = ', { "name":"' + info[0] + '" , "rating":"' + 
                        info[2] + '" , "diet":"' + info[3] + '" , "time":"' + 
                        info[4] + '" , "imgUrl":"' + imgUrl + '" }';

                        recipeList += recipeJSON;
                    }
                }
                
            });

            recipeList += (' ]}');
            recipeList = '{ "recipes" : [' + recipeList.substr(2);

            // sending JSON format booklist to front end
            res.send(JSON.parse(recipeList));
        }
    }  
    else if (req.query.mode == 'desc') {

        // We already have all the other important query info, so let's just
        // get ingredients and steps.

        let recipe = req.query.recipe;

        console.log(recipe);

        let ingredients  = read_file('recipes/' + recipe + '/ingredients.txt').split('\n');
        let steps = read_file('recipes/' + recipe + '/steps.txt').split('\n');

        let ingrString = '[';
        let stepString = '[';

        // Building JSON for ingredients and steps:

        for (let i = 0; i < ingredients.length; i++) {
            if (i == ingredients.length - 1) {
                ingrString += ' "' + ingredients[i] + '"';
            } else {
                ingrString += ' "' + ingredients[i] + '",';
            }
            
        }
        ingrString = ingrString + ' ]';

        console.log(ingrString);

        for (let i = 0; i < steps.length; i++) {
            if (i == steps.length - 1) {
                stepString += ' "' + steps[i] + '"';
            } else {
                stepString += ' "' + steps[i] + '",';
            }
        }
        stepString = stepString + ' ]';

        console.log(stepString);

        let recipeJSON  = '{ "ingredients":' + ingrString + ', "steps":' + stepString + ' }';

        console.log(recipeJSON);

        // Sending back ingredients and steps in JSON format
        res.send(JSON.parse(recipeJSON));
    }
    
	
});

/**
 *  Reads a file
*/ 
function read_file(fileName) {
	let fileInfo = 0;
	try {  
	    fileInfo = fs.readFileSync(fileName, 'utf8');    
	} catch(e) {
	    console.log('Error:', e.stack);
	}
	return fileInfo;
}

/**
 *  Finds a line in a read file
 */ 
function find_recipes(file, keyword, rating, diet) {
    let lines = file.toString().split("\n");
    let recipes = [];
    let line = "";

    let keywords = keyword.split(" ");

    console.log(lines);

    // Diet can't be null

    // If rating and keyword are null don't include them search:
    if (rating == null && keyword == null) {

        console.log("Rating null and keyword blank");

        for (let i = 0; i < lines.length; i++) {
            
            let recipeDiet = lines[i].split(" ")[3];
    
            // Checking input parameters...
            if (lines[i] != "") {
                if (((diet.toLowerCase == recipeDiet.toLowerCase() || 
                diet.toLowerCase() == "all") || 
                (diet.toLowerCase() == "vegetarian" && recipeDiet.toLowerCase() == "vegan"))) {
                    line = lines[i];
                    recipes.push(line);
                }
            }
            
        }
        return recipes;
    } 

    // If just rating is null...
    if (rating == null) {

        console.log("Rating null");


        for (let i = 0; i < lines.length; i++) {

            let recipeDiet = lines[i].split(" ")[3];
    
            

            if (lines[i] != "") {

                // Checking input parameters...
                for (let j = 0; j < keywords.length; j++) {
                    if (lines[i].split(" ")[1].toLowerCase().includes(keywords[j].toLowerCase()) && 
                    (diet.toLowerCase() == recipeDiet.toLowerCase() || 
                    diet.toLowerCase() == "all" || 
                    (diet.toLowerCase() == "vegetarian" && recipeDiet.toLowerCase() == "vegan"))) {
                        line = lines[i];
                        recipes.push(line);
                        break;
                    }
                } 
            }
        }
    } 
    else if (rating != null && keyword == "") { // If just keyword is blank...

        console.log("Keyword blank");

        for (let i = 0; i < lines.length; i++) {
            
            let recipeRating = lines[i].split(" ")[2];
            console.log(recipeRating);
            console.log(rating);
            let recipeDiet = lines[i].split(" ")[3];
            
            // Checking input parameters...
            if (lines[i] != "") {
                if (rating <= recipeRating && 
                    (diet.toLowerCase() == recipeDiet.toLowerCase() || diet.toLowerCase() == "all" ||
                    (diet.toLowerCase() == "vegetarian" && recipeDiet.toLowerCase() == "vegan"))) {
                        line = lines[i];
                        recipes.push(line);
                }
            }
            
        }
    } else { // If every parameter is input...

        for (let i = 0; i < lines.length; i++) {
            
            let recipeRating = lines[i].split(" ")[2];
            let recipeDiet = lines[i].split(" ")[3];
    
            if (lines[i] != "") {

                // Checking input parameters...
                for (let j = 0; j < keywords.length; j++) {
                    if (lines[i].split(" ")[1].toLowerCase().includes(keywords[j].toLowerCase()) && 
                    rating <= recipeRating && 
                    (diet.toLowerCase() == recipeDiet.toLowerCase() || diet.toLowerCase() == "all" || 
                    (diet.toLowerCase() == "vegetarian" && recipeDiet.toLowerCase() == "vegan"))) {
                        line = lines[i];
                        recipes.push(line);
                        break;
                    }
                }
            }
        }
    }

	return recipes;
}

// Listen to port 3000
app.listen(3000);
