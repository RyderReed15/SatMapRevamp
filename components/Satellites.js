
import { StyleSheet, Text, View } from 'react-native';
import { gstime, eciToEcf, propagate, twoline2satrec, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js';

import {clearClickIndices, fillClickIndices } from './SatelliteCanvas'

import { useRef, useState, useEffect } from 'react';

import useWindowDimensions from "../utils/Window.js";


const TLE_INFO = require('../assets/TLE_EXAMPLE.json');
const EARTH_RADIUS = 6378.14; // Earth radius in km

let TLE_DATA = TLE_INFO.data;

let satScreenInfo = [];
let propagatedData = [];
let satRecords = [];
let selectedIndex = 0;

export async function initialize() {
    await TLE_DATA;
    parseTLEs();
}

export function getPropagatedData() {
    return propagatedData;
}

export function getScreenInfo() {
    return satScreenInfo;
}

export function getRecords() {
    return satRecords;
}

export function getSelectedIndex() {
    return selectedIndex;
}

export function setSelectedIndex(index) {
    selectedIndex = index;
}



function cameraTransform(roll, yaw, x, y, z) {

    let transform = { x, y, z };

    //View transform
    transform.x = (x * Math.cos(yaw) + y * Math.sin(yaw));
    transform.y = (-x * Math.sin(yaw) * Math.cos(roll) + y * Math.cos(yaw) * Math.cos(roll) + z * Math.sin(roll));
    transform.z = (x * Math.sin(yaw) * Math.sin(roll) - y * Math.cos(yaw) * Math.sin(roll) + z * Math.cos(roll));

    return transform;
}

export function transformCoords(zoom, roll, yaw, height, width) {

    clearClickIndices(width, height);

    const divisor = EARTH_RADIUS / (height * zoom / 200);

    satScreenInfo = []

    for (let i = 0; i < propagatedData.length; i++) {

        let position = cameraTransform(roll, yaw, propagatedData[i].position.x, propagatedData[i].position.y, propagatedData[i].position.z);

        if (position.z > 0 || Math.sqrt(position.x * position.x + position.y * position.y) > EARTH_RADIUS) {

            position.x /= divisor;
            position.y /= -divisor;

            position.x = Math.floor(position.x + width / 2);
            position.y = Math.floor(position.y + height / 2);

            satScreenInfo.push({ selected: i == selectedIndex, name: propagatedData[i].name, x: position.x, y: position.y, z: position.z });

            fillClickIndices(i, height, width, position.x, position.y, zoom);
        }
    }
}

export function propagateData() {

    propagatedData = [];
    
    for (let i = 0; i < satRecords.length; i ++) {

        let time = new Date();

        var positionAndVelocity = propagate(satRecords[i].satrec, time);

        if (positionAndVelocity.position) {
            var ecfCoords = eciToEcf(positionAndVelocity.position, gstime(time));


            propagatedData.push({ name: satRecords[i].name, position: ecfCoords, velocity: positionAndVelocity.velocity });
        }
    }   
}

function parseTLEs() {

    let lines = TLE_DATA.split("\n");

    if (lines.length === 1) return;

    satRecords = [];

    for (let i = 0; i < lines.length; i += 3) {

        var name = lines[i],
            tle1 = lines[i + 1],
            tle2 = lines[i + 2];

        try {
            var satrec = twoline2satrec(tle1, tle2);

            satRecords.push({ name: name, satrec: satrec });
        } catch {
            if (lines.length % 3 != 0) {
                console.log("Improperly formatted TLE file");
            } else {
                console.log("Error in sat record at line ", i)
            }
        }
    }
}

async function getTLE() {

    let url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=ACTIVE&FORMAT=TLE';

    // do the POST request
    try {
        let response = await fetch(url, { method: 'GET' });

        if (response.ok && response.status === 200 && response.type != 'error') {
            // success, redirect user
            // check if this url specifies a url to which to redirect
            return await response.text().split("\n");
        }
        else {
            return "UHOH STINKY"

        }
    }
    catch (error) {
        console.log("error in in POST request to login (/authenticate.php)");
        console.log(error);
    }
}