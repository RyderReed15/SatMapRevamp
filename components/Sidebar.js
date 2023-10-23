import { StyleSheet, Text, View } from 'react-native';

import { useState, useEffect } from 'react';

import { gstime, eciToEcf, propagate, twoline2satrec, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js';


import { getSatInfo } from "./Satellites.js";



const PAGE_SIZE = 100;
const EARTH_RADIUS = 6378.14; // Earth radius in km

let satInfoIndex = 0;

let satInfo = [];

export default function Sidebar() {

    const [count, setCount] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            if (!satInfo.length) {
                setCount((oldCount) => oldCount + 1);
            } else {
                setCount((oldCount) => oldCount + 1);
                clearInterval(id);
            }
        }, 500);

        return () => {
            if (!satInfo.length) clearInterval(id);
        };
    }, []);

    const [page, setPage] = useState(0);


    return (
        <View style={styles.sidebar} >
            <SatInfo />

            <View>
                <Text style={[styles.satText, {alignSelf: 'flex-end', paddingBottom: '.5em'}] }>
                    Page {page} - Showing {page * PAGE_SIZE + 1} - {(page + 1) * PAGE_SIZE} of {satInfo.length + 1 }
                </Text>
            </View>

            <View style={styles.satInfoContainer}>
                {getListEntries(satInfo, page)}
            </View>
        </View>
    );

}

function SatInfo() {

    updateView(1000);

    let [displayInfo, setDisplayInfo] = useState({
        name: "LOADING ...",
        altitude: EARTH_RADIUS,
        velocity: 0,
        longitude: 0,
        latitude: 0
    });

    satInfo = getSatInfo();

    if (satInfo && satInfo.length) {
        var altitude = Math.sqrt(satInfo[satInfoIndex].position.x * satInfo[satInfoIndex].position.x + satInfo[satInfoIndex].position.y * satInfo[satInfoIndex].position.y + satInfo[satInfoIndex].position.z * satInfo[satInfoIndex].position.z);
        var velocity = Math.sqrt(satInfo[satInfoIndex].velocity.x * satInfo[satInfoIndex].velocity.x + satInfo[satInfoIndex].velocity.y * satInfo[satInfoIndex].velocity.y + satInfo[satInfoIndex].velocity.z * satInfo[satInfoIndex].velocity.z);

        var geo = eciToGeodetic(satInfo[satInfoIndex].position, gstime(new Date()));

        var latitudeStr = degreesLat(geo.latitude),
            longitudeStr = degreesLong(geo.longitude);

        displayInfo = {
            name: satInfo[satInfoIndex].name,
            altitude: altitude,
            velocity: velocity,
            longitude: longitudeStr,
            latitude: latitudeStr
        }
    } 

    return(
        
        <View style={styles.satInfo}>
            <Text style={[styles.satText, { fontSize: '1.1em', fontWeight: 'bolder' }]}>{displayInfo.name}</Text>
            <View style={{ width: '75%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.satText}>Altitude:</Text>
                <Text style={styles.satText}>{(displayInfo.altitude - EARTH_RADIUS).toFixed(2)} km</Text>
            </View>
            <View style={{ width: '75%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.satText}>Velocity:</Text>
                <Text style={styles.satText}>{(displayInfo.velocity * 1000).toFixed(2)} m/s</Text>
            </View>


            <table style={{ width: '75%' }}>
                <tbody>
                    <tr>
                        <td style={styles.satText}>Longitude:</td>
                        <td style={styles.satText}>Latitude:</td>
                    </tr>

                    <tr>
                        <td style={styles.satText}>{(displayInfo.longitude).toFixed(2)}�</td>
                        <td style={styles.satText}>{(displayInfo.latitude).toFixed(2)}�</td>
                    </tr>
                </tbody>

            </table>
        </View>
      
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




function getListEntries(satInfo, page = 0) {



    let entries = [];

    if (satInfo) {
        for (let i = page * PAGE_SIZE; i < satInfo.length && i < (page + 1) * PAGE_SIZE; i++) {

            var altitude = Math.sqrt(satInfo[i].position.x * satInfo[i].position.x + satInfo[i].position.y * satInfo[i].position.y + satInfo[i].position.z * satInfo[i].position.z);

            entries.push(<SatelliteInfo style={[styles.border, i > page * PAGE_SIZE ? { borderTopStyle: 'solid' } : {}]} key={i * 2 - 1} name={satInfo[i].name} altitude={altitude} onClick={() => { satInfoIndex = i; }} />);

        }
    }



    return entries;

}

function SatelliteInfo(props) {


    return (
        <View style={[props.style, styles.satEntry]} onClick={props.onClick }>

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
    border: {
        borderStyle: 'none',
        borderWidth: '1px',
        borderColor: '#444'
    },
    satEntry: {
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
    },
    sidebar: {
        maxHeight: '100vh',
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '15%',
        backgroundColor: '#111',
        overflow: 'hidden'
    },
    satInfoContainer: {

        flex: 1,
        overflowY: 'scroll',
        scrollbarWidth: 'thin',

        //borderWidth: '1px',
        borderColor: '#444',

    },
    satInfo: {

        maxHeight: '25vh',
        height: '10em',

        borderWidth: '1px',
        borderColor: '#444',

    },
    satText: {
        paddingTop: '.5em',
        paddingLeft: '.5em',
        paddingRight: '.5em',
        color: '#ccc',
        fontSize: '1em'

    }
});
