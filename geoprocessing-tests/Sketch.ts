//Includes
import { test, expect } from "@playwright/test";
import { TestCategory } from "../interfaces/test-case.interface";
import { assertAttributeMatchers } from "../utils/attribute-matcher";
import { parse } from "csv-parse/sync";
import fs from "fs";


import dotenv from "dotenv";
var path = require("path");


//Define global variables and access other files

const domainCSVlocation = "../data/Domain_test2.csv";
const addressCSVlocation = "../data/geocoding-addresses-single.csv";

const domainsCSV = parse(fs.readFileSync(path.join(__dirname, domainCSVlocation)),{
  //Insert desired .csv formatting parameters.
});
const addressesCSV = parse(fs.readFileSync(path.join(__dirname, addressCSVlocation)),{
  //Insert desired .csv formatting parameters.
  columns: true
});

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log(`Loaded ${addressesCSV.length} geocoding test categories`);

//Testing Row X of .csv
//Looping for each attribute
//Testing each attribute with each domain