import { StyleSheet, Text, View } from 'react-native';

import { useState, useEffect } from 'react';




import { getSatInfo } from "./Satellites.js";


import SatelliteInfo from "./SatelliteInfo.js"



const EARTH_RADIUS = 6378.14; // Earth radius in km

let displayInfo = {
    name: "STARLINK",
    altitude: 7000,
    velocity: 10000,
    longitude: 100,
    latitude: 15
}

export default function Sidebar() {

    updateView(1000);

    let [satInfo, setSatInfo] = useState(null);

    satInfo = getSatInfo();

    return (

        <View style={styles.sidebar} >
            <View style={styles.satInfo}>
                <Text style={[styles.satText, { fontSize: '1.1em', fontWeight: 'bolder' }]}>{displayInfo.name}</Text>
                <View style={{ width: '75%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.satText}>Altitude:</Text>
                    <Text style={styles.satText}>{(displayInfo.altitude - EARTH_RADIUS).toFixed(2)} km</Text>
                </View>
                <View style={{ width: '75%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.satText}>Velocity:</Text>
                    <Text style={styles.satText}>{(displayInfo.velocity).toFixed(2)} km/s</Text>
                </View>


                <table style={{ width: '75%' }}>
                    <tbody>
                        <tr>
                            <td style={styles.satText}>Longitude:</td>
                            <td style={styles.satText}>Latitude:</td>
                        </tr>

                        <tr>
                            <td style={styles.satText}>{(displayInfo.longitude).toFixed(2)}°</td>
                            <td style={styles.satText}>{(displayInfo.latitude).toFixed(2)}°</td>
                        </tr>
                    </tbody>

                </table>
            </View>
            <View style={styles.satInfoContainer}>
                {getListEntries(satInfo)}
            </View>
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

    const pageSize = 50;

    let entries = [];

    if (satInfo) {
        for (let i = page * pageSize; i < satInfo.length && i < (page + 1) * pageSize; i++) {

            if (i > 0) {
                entries.push(<View key={i * 2} style={{ alignSelf: 'center', height: '1px', width: '90%', backgroundColor: '#444' }} />);
            }
            entries.push(<SatelliteInfo key={i * 2 - 1} name={satInfo[i].name} altitude={satInfo[i].altitude} />);

        }
    }



    return entries;

}

const styles = StyleSheet.create({
    sidebar: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '15%',
        backgroundColor: '#111'
    },
    satInfoContainer: {

        flex: 1,
        maxHeight: '100vh',
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
        color: '#ddd',
        fontSize: '1em'

    }
});
