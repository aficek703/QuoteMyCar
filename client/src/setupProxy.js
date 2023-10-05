"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var vite_express_1 = require("vite-express");
var app = (0, express_1.default)();
var accessToken = "6699305e-93b8-47d8-b481-e79f1acd18a5";
app.get("/", function (_, res) {
    fetch("https://carapi.app/api/makes", {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer ".concat(accessToken),
        },
    })
        .then(function (response) { return response.json(); })
        .then(function (data) { return res.json(data); }) // send the data to the frontend
        .catch(function (error) { return console.error("Error:", error); });
});
vite_express_1.default.listen(app, 3000, function () { return console.log("Server is listening..."); });
