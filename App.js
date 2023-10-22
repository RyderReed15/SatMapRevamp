import { StyleSheet, View } from 'react-native';

import { useState, useEffect } from 'react';


import useWindowDimensions from "./utils/Window.js";

import Satellites, { handleClick } from "./components/Satellites.js";

import Earth from "./components/Earth.js";

import Sidebar from './components/Sidebar.js'; 




const Stars = require("./assets/background.jpg");



export default function App() {

    return (
        <View style={styles.container}>

            <Sidebar />

            <SpaceView/>
        </View>
    );
}


function SpaceView() {

    const { height, width } = useWindowDimensions();

    let [hd, setHD] = useState(false);
    let [zoom, setZoom] = useState(75);
    let [mouseDown, setMouseDown] = useState(false);
    let [roll, setRoll] = useState(Math.PI / 2);
    let [yaw, setYaw] = useState(0);



    const handleScroll = (e) => {

        if (e.target.id != "satellite_canvas") return;

        zoom = zoom * (1 + e.wheelDelta / 900);
        zoom = (zoom > 1000 ? 1000 : (zoom < 10 ? 10 : zoom));
        setZoom(zoom);
        styles.circle = {
            position: 'absolute',
            backgroundColor: 'blue',
            aspectRatio: 1,
            width: `${zoom}vh`,
            borderRadius: '50%',
            transition: '25ms',
            overflow: 'hidden'

        };
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
        <View style={styles.container}>
            <Earth style={{ position: 'absolute' }} hd={hd} height={height} zoom={zoom} yaw={yaw} roll={roll} />

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
        backgroundImage: `url(${Stars})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    circle: {
        position: 'absolute',
        backgroundColor: 'blue',
        aspectRatio: 1,
        width: '75vh',
        borderRadius: '50%',
        overflow: 'hidden'
    },
    
});
