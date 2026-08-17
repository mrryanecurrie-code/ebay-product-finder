import test from "node:test";import assert from "node:assert/strict";import {convertCurrency,assertCurrency} from "../src/domain/currency.js";
test("USD remains USD",()=>assert.deepEqual(convertCurrency(20,"USD"),{amount:20,currency:"USD",rate:1}));
test("CAD cannot silently enter USD economics",()=>assert.throws(()=>assertCurrency("CAD","USD"),/Expected USD/));
test("CAD converts only with explicit rate",()=>assert.deepEqual(convertCurrency(10,"CAD","USD",{CAD_USD:.73}),{amount:7.3,currency:"USD",rate:.73}));
