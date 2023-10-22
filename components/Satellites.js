
import { StyleSheet, Text, View } from 'react-native';
import { gstime, eciToEcf, propagate, twoline2satrec, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js';

import { useRef, useState, useEffect } from 'react';

import useWindowDimensions from "../utils/Window.js";


const TLE_INFO = require('../assets/TLE_EXAMPLE.txt');
const EARTH_RADIUS = 6378.14; // Earth radius in km

let TLE_DATA = "";

getTLEData();

let satPositions = [];
let satScreenInfo = [];
let satNames = [];
let satInfo = [];

setInterval(parseTLEs, 1000);

export default function Satellites(props) {

    updateView(1000);

    const { height, width } = useWindowDimensions();


    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;


        transformCoords(props.zoom, props.roll, props.yaw, height, width);
        drawSats(canvas, props.zoom);
    });
    return (
        <canvas id="satellite_canvas" style={{ position: 'absolute', top: 0, left: 0 }} ref={canvasRef} width={width} height={height} />
    );
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
    //let pitch = 3.14159268, yaw =  1.5707963267948966192313216916398; // RADIANS

    let transform = { x, y, z };


    //View transform
    transform.x = (x * Math.cos(yaw) + y * Math.sin(yaw));
    transform.y = (-x * Math.sin(yaw) * Math.cos(roll) + y * Math.cos(yaw) * Math.cos(roll) + z * Math.sin(roll));
    transform.z = (x * Math.sin(yaw) * Math.sin(roll) - y * Math.cos(yaw) * Math.sin(roll) + z * Math.cos(roll));


    return transform;
}


async function getTLEData() {

    let response = await fetch(TLE_INFO);

    TLE_DATA = "" + await response.text();

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



function transformCoords(zoom, roll, yaw, height, width) {




    const divisor = EARTH_RADIUS / (height * zoom / 200);


    satScreenInfo = []



    for (let i = 0; i < satPositions.length; i++) {

        let position = cameraTransform(roll, yaw, satPositions[i].x, satPositions[i].y, satPositions[i].z);



        if (position.z >= 0 || Math.sqrt(position.x * position.x + position.y * position.y) > EARTH_RADIUS) {

            position.x /= divisor;
            position.y /= -divisor;

            position.x = Math.floor(position.x + width / 2);
            position.y = Math.floor(position.y + height / 2);

            satScreenInfo.push({ name: satNames[i], x: position.x, y: position.y });

        }

    }
}

export function handleClick(x, y) {
    for (let i = 0; i < satScreenInfo.length; i++) {
        if (x >= satScreenInfo[i].x && x <= satScreenInfo[i].x + 2 && y >= satScreenInfo[i].y && y <= satScreenInfo[i].y + 2) {

            alert(satScreenInfo[i].name);
        }


    }
}

function drawSats(canvas, zoom) {

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    context.font = "14px Helvetica";

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




async function parseTLEs() {
 
    let start = new Date();

    let lines = TLE_DATA.split("\n");

    if (lines.length === 1) return;

    satPositions = [];
    satNames = [];
    satInfo = [];

    for (let i = 0; i < lines.length; i += 3) {

        var name = lines[i],
            tle1 = lines[i + 1],
            tle2 = lines[i + 2];



        var satrec = twoline2satrec(tle1, tle2);

        let time = new Date();

        var positionAndVelocity = propagate(satrec, new Date(time.getTime()));

        if (positionAndVelocity.position) {
            var ecfCoords = eciToEcf(positionAndVelocity.position, gstime(new Date()));

            satPositions.push(ecfCoords);
            satNames.push(name);
           
            satInfo.push({ name: name, position: positionAndVelocity.position, velocity: positionAndVelocity.velocity });
        }

    }
    let end = new Date();

    console.log(end.getTime() - start.getTime());

}