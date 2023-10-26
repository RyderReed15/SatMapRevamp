
import { StyleSheet, Text, View } from 'react-native';
import { gstime, eciToEcf, propagate, twoline2satrec, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js';
import { getScreenInfo, transformCoords, setSelectedIndex} from './Satellites.js'

import { useRef, useState, useEffect } from 'react';

import useWindowDimensions from "../utils/Window.js";

const UPDATE_INTERVAL = 1000;

let clickIndices = [[]];

export default function SatelliteCanvas(props) {

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

function updateView(interval) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setCount((oldCount) => oldCount + 1), interval);

        return () => {
            clearInterval(id);
        };
    }, []);
}

export function clearClickIndices(width, height) {
    clickIndices = [[]];

    for (let i = 0; i < width; i++) {
        clickIndices.push(Array(height).fill(-1, 0, height-1));
    }
}

export function fillClickIndices(index, height, width, x, y, zoom){

    if (x > 0 && y > 0) {

        let size = Math.floor(Math.ceil(Math.log(zoom) - 2) * 1.33);
        size = size < 1 ? 1 : size;

        let startX  = (x - 2) >= 0             ? x - 2        : 0;
        let endX    = (x + size + 2) < width   ? x + size + 2 : width - 1;
        let startY  = (y - 2) >= 0             ? y - 2        : 0;
        let endY    = (y + size + 2) < height  ? y + size + 2 : height - 1;

        for (let j = startX; j <= endX; j++) {
            clickIndices[j].fill(index, startY, endY);
        }
    }

}

export function handleClick(x, y) {
    let index = clickIndices[x][y];

    if (index != -1) {
        setSelectedIndex(index);
       
    }
}

function drawSats(canvas, zoom) {

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    context.font = "14px Segoe UI";

    let size = Math.floor(Math.ceil(Math.log(zoom) - 2) * 1.33);
    size = size < 1 ? 1 : size;

    let satScreenInfo = getScreenInfo();

    for (let i = 0; i < satScreenInfo.length; i++) {
        /*if (satScreenInfo[i].name.includes("STARLINK")){
            context.fillStyle = '#f00';
        }else if(satScreenInfo[i].leo){
            context.fillStyle = '#0f0';
        }else{
            context.fillStyle = '#fff';
        }*/

        if(satScreenInfo[i].selected) context.fillStyle = '#f00';
        else context.fillStyle = '#fff';

        if (zoom > 500) {
            context.fillText(satScreenInfo[i].name, satScreenInfo[i].x + 10, satScreenInfo[i].y + 8);
        }
        let newSize = size + (satScreenInfo[i].selected ? 3 : 0);
        context.fillRect(satScreenInfo[i].x, satScreenInfo[i].y, newSize, newSize);
    }
}