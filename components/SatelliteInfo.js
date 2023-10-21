import { StyleSheet, Text, View } from 'react-native';

import { useRef, useState, useEffect } from 'react';


import useWindowDimensions from "../utils/Window.js";

const EARTH_RADIUS = 6378.14; // Earth radius in km


export default function SatelliteInfo(props) {


    return (
        <View style={styles.satInfo}>

            <Text style={styles.infoText}>{props.name}</Text>

            {getAltitudeText(props.altitude)}


        </View>
    );
}

function getAltitudeText(altitude) {

    if (altitude - EARTH_RADIUS < 2000) {

        return (<Text style={styles.leoText}>LEO</Text>);
    } else if (altitude - EARTH_RADIUS < 35500) {
        return (<Text style={styles.meoText}>MEO</Text>);

    } else if (altitude - EARTH_RADIUS < 36000) {
        return (<Text style={styles.geoText}>GEO</Text>);
    } else {
        return (<Text style={styles.infoText}>HEO</Text>);
    }
}

const styles = StyleSheet.create({


    satInfo: {
        width: '100%',
        padding: '.5em',
        justifyContent: 'space-between',
        alignItems: 'left',
        flexDirection: 'row',

    },
    infoText: {

        color: '#ccc',

    },
    leoText: {

        color: '#0f0',

    },
    meoText: {

        color: '#ff0',

    },
    geoText: {

        color: '#f00',

    }

});