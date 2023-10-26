
import { StyleSheet, Text, View } from 'react-native';
import { gstime, eciToEcf, propagate, twoline2satrec, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js';

import { useRef, useState, useEffect } from 'react';

import useWindowDimensions from "../utils/Window.js";
import { setSatIndex } from './Sidebar.js';


const TLE_INFO = require('../assets/TLE_EXAMPLE.json');
const EARTH_RADIUS = 6378.14; // Earth radius in km
const UPDATE_INTERVAL = 1000;

let TLE_DATA = TLE_INFO.data;

let satScreenInfo = [];
let satInfo = [];
let satRecords = [];
let clickIndices = [[]];



setInterval(propogateData, UPDATE_INTERVAL);
initialize();

export default function Satellites(props) {

    updateView(UPDATE_INTERVAL);

    const { height, width } = useWindowDimensions();



    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;


        transformCoords(props.zoom, props.roll, props.yaw, height, width);
        drawSats(canvas, props.zoom);
    });
    return (
        <canvas id="satellite_canvas" style={{ position: 'absolute', top: 0, left: '0em' /*-9em to offset by sidebar*/ }} ref={canvasRef} width={width} height={height} />
    );
}


async function initialize() {
    await TLE_DATA;
    parseTLEs();
}


export function getSatInfo() {
    return satInfo;
}


function updateView(interval) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setCount((oldCount) => oldCount + 1), interval);

        return () => {
            clearInterval(id);
        };
    }, []);
}



function cameraTransform(roll, yaw, x, y, z) {

    let transform = { x, y, z };

    //View transform
    transform.x = (x * Math.cos(yaw) + y * Math.sin(yaw));
    transform.y = (-x * Math.sin(yaw) * Math.cos(roll) + y * Math.cos(yaw) * Math.cos(roll) + z * Math.sin(roll));
    transform.z = (x * Math.sin(yaw) * Math.sin(roll) - y * Math.cos(yaw) * Math.sin(roll) + z * Math.cos(roll));


    return transform;
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

function fillScreenIndices(width, height) {
    clickIndices = [[]];

    for (let i = 0; i < width; i++) {
        clickIndices.push(Array(height).fill(-1, 0, height-1));
    }
}

function transformCoords(zoom, roll, yaw, height, width) {

    fillScreenIndices(width, height);

    const divisor = EARTH_RADIUS / (height * zoom / 200);

    satScreenInfo = []

    for (let i = 0; i < satInfo.length; i++) {

        let position = cameraTransform(roll, yaw, satInfo[i].position.x, satInfo[i].position.y, satInfo[i].position.z);

        if (position.z > 0 || Math.sqrt(position.x * position.x + position.y * position.y) > EARTH_RADIUS) {

            position.x /= divisor;
            position.y /= -divisor;

            position.x = Math.floor(position.x + width / 2);
            position.y = Math.floor(position.y + height / 2);

            satScreenInfo.push({ name: satInfo[i].name, x: position.x, y: position.y, z: position.z });

            if (position.x > 0 && position.y > 0) {

                let size = Math.floor(Math.ceil(Math.log(zoom) - 2) * 1.33);
                size = size < 1 ? 1 : size;

                let startX  = (position.x - 2) >= 0             ? position.x - 2        : 0;
                let endX    = (position.x + size + 2) < width   ? position.x + size + 2 : width - 1;
                let startY  = (position.y - 2) >= 0             ? position.y - 2        : 0;
                let endY    = (position.y + size + 2) < height  ? position.y + size + 2 : height - 1;

                for (let j = startX; j <= endX; j++) {
                    clickIndices[j].fill(i, startY, endY);
                }
            }
        }
    }
}

export function handleClick(x, y) {
    let index = clickIndices[x][y];

    if (index != -1) {
        setSatIndex(index);
       
    }
    
}

function drawSats(canvas, zoom) {

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    context.font = "14px Segoe UI";

    let size = Math.floor(Math.ceil(Math.log(zoom) - 2) * 1.33);
    size = size < 1 ? 1 : size;

    for (let i = 0; i < satScreenInfo.length; i++) {
        /*if (satScreenInfo[i].name.includes("STARLINK")){
            context.fillStyle = '#f00';
        }else if(satScreenInfo[i].leo){
            context.fillStyle = '#0f0';
        }else{
            context.fillStyle = '#fff';
        }*/

        if (zoom > 500) {
            context.fillText(satScreenInfo[i].name, satScreenInfo[i].x + 10, satScreenInfo[i].y + 8);
        }

        context.fillRect(satScreenInfo[i].x, satScreenInfo[i].y, size, size);
    }
}


function propogateData() {

    satInfo = [];
    
    for (let i = 0; i < satRecords.length; i ++) {

        let time = new Date();

        var positionAndVelocity = propagate(satRecords[i].satrec, time);

        if (positionAndVelocity.position) {
            var ecfCoords = eciToEcf(positionAndVelocity.position, gstime(time));


            satInfo.push({ name: satRecords[i].name, position: ecfCoords, velocity: positionAndVelocity.velocity });
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