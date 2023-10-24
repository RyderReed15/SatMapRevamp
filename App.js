import { StyleSheet, View, Image } from 'react-native';

import { useState, useEffect } from 'react';


import useWindowDimensions from "./utils/Window.js";

import Satellites, { handleClick } from "./components/Satellites.js";

import Earth from "./components/Earth.js";

import Sidebar from './components/Sidebar.js'; 

import Button from './components/Button.js';

const Stars = require("./assets/background.jpg");

import MapImage from './assets/bxs-image.svg';




export default function App() {

    return (
        <View style={styles.container}>

            <Image source={Stars} style={{ position: 'absolute', top: 0, width: '100vw', height: '100vh' }} / >

            <Sidebar  />

            <SpaceView style={{ zIndex: 2 }}/>
        </View>
    );
}


function SpaceView() {

    const { height, width } = useWindowDimensions();

    let [map, setMap] = useState(0);
    let [zoom, setZoom] = useState(75);
    let [mouseDown, setMouseDown] = useState(false);
    let [roll, setRoll] = useState(Math.PI / 2);
    let [yaw, setYaw] = useState(0);

    const handleScroll = (e) => {

        if (e.target.id != "satellite_canvas") return;

        zoom = zoom * (1 + e.wheelDelta / 900);
        zoom = (zoom > 1000 ? 1000 : (zoom < 10 ? 10 : zoom));
        setZoom(zoom);
        
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

            <Earth style={{ position: 'absolute' }} map={map} height={height} zoom={zoom} yaw={yaw} roll={roll} />

            <Satellites style={styles.satellite} zoom={zoom} roll={roll} yaw={yaw} />
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
    buttonIcon: {
        width: '4em',
        fill: '#ccc'
    }
});
