import { StyleSheet, View, Image } from 'react-native';

import { useState, useEffect } from 'react';

import useWindowDimensions from "./utils/Window.js";

import SatelliteCanvas, { handleClick } from "./components/SatelliteCanvas.js";

import { getPropagatedData, getScreenInfo, getSelectedIndex, setSelectedIndex, propagateData, initialize, transformCoords } from "./components/Satellites.js";

import Earth from "./components/Earth.js";

import Sidebar from './components/Sidebar.js'; 

import Button from './components/Button.js';

const Stars = require("./assets/background.jpg");

import MapImage from './assets/bx-globe.svg';
import ZoomIn from './assets/bxs-zoom-in.svg';
import ZoomOut from './assets/bxs-zoom-out.svg';



initializeApp();
setInterval(update, 1000);


export default function App() {

    return (
        <View style={styles.container}>

            <Image source={Stars} style={{ position: 'absolute', top: 0, width: '100vw', height: '100vh' }} / >

            <Sidebar  />

            <SpaceView/>
        </View>
    );
}

function initializeApp() {
    initialize();

}

function update() {
    propagateData();
}


function SpaceView() {

    const { height, width } = useWindowDimensions();

    let [map, setMap] = useState(0);
    let [zoom, setZoom] = useState(75);
    let [mouseDown, setMouseDown] = useState(false);
    let [roll, setRoll] = useState(Math.PI / 2);
    let [yaw, setYaw] = useState(0);

    const changeZoom = (changeBy) => {
        zoom *= changeBy;
        zoom = (zoom > 1000 ? 1000 : (zoom < 10 ? 10 : zoom));
        setZoom(zoom);
    }

    const handleScroll = (e) => {

        if (e.target.id != "satellite_canvas") return;

        changeZoom(1 + e.wheelDelta / 900);
    };

    const handleMouseDown = (e) => {
        if (e.target.id != "satellite_canvas") return;
        mouseDown = true;
        setMouseDown(true);
    };

    const handleMouseUp = (e) => {
        if (e.target.id === "satellite_canvas") {
            handleClick(e.clientX, e.clientY);
        }
        mouseDown = false;
        setMouseDown(false);
    };

    const handleMouseMove = (e) => {

        if (mouseDown === true) {

            let percent = Math.PI / (zoom * height / 100);
            roll = roll - e.movementY * percent;
            roll = (roll > Math.PI ? Math.PI : (roll < 0 ? 0 : roll));
            yaw = yaw - e.movementX * percent;
            setRoll(roll);
            setYaw(yaw);
        }
    };

    useEffect(() => {
        window.addEventListener('wheel', handleScroll, { passive: true });
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);


        return () => {
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: '#00000000' }]}>

            <Button style={styles.changeMap} svg={MapImage} iconStyle={styles.buttonIcon} onClick={() => setMap(!map)} />

            <Button style={styles.zoomButton}                       svg={ZoomIn}    iconStyle={styles.buttonIcon} onClick={() => changeZoom(1.3)} />
            <Button style={[styles.zoomButton, { right: '2.5em' }]} svg={ZoomOut}   iconStyle={styles.buttonIcon} onClick={() => changeZoom(1/1.3)} />

            <Earth style={{ position: 'absolute' }} map={map} height={height} zoom={zoom} yaw={yaw} roll={roll} />

            <SatelliteCanvas style={styles.satellite} zoom={zoom} roll={roll} yaw={yaw} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#050818',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexDirection: 'row'
    },
    changeMap: {
        zIndex: 1,
        width: '4em',
        height: '4em',
        fontSize: '1em',
        borderRadius: 15,
        borderColor: '#CCC',
        position: 'absolute',
        top: '.5em',
        right: '.5em',
        alignSelf: 'flex-end'
    },
    zoomButton: {
        zIndex: 1,
        width: '2em',
        height: '2em',
        fontSize: '1em',
        borderRadius: 15,
        borderColor: '#CCC',
        position: 'absolute',
        bottom: '.5em',
        right: '.5em',
        alignSelf: 'flex-end'
    },
    buttonIcon: {
        width: '100%',
        fill: '#ccc'
    }
});
