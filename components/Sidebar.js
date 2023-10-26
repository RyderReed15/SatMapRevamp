import { StyleSheet, Text, View } from 'react-native';

import { useState, useEffect } from 'react';

import { gstime, eciToEcf, propagate, twoline2satrec, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js';


import { getSatInfo } from "./Satellites.js";
import Button from './Button.js';



const PAGE_SIZE = 100;
const EARTH_RADIUS = 6378.14; // Earth radius in km

let satInfoIndex = 0;

let satInfo = [];

import LeftChevron from '../assets/bx-chevron-left.svg';
import RightChevron from '../assets/bx-chevron-right.svg';
import DoubleLeftChevron from '../assets/bx-chevrons-left.svg';
import DoubleRightChevron from '../assets/bx-chevrons-right.svg';

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

    const changePage = (pageNum) => {
        if (pageNum < 0) {
            setPage(0);
        } else if (pageNum > satInfo.length / PAGE_SIZE) {
            setPage(Math.floor(satInfo.length / PAGE_SIZE));
        }else{
            setPage(pageNum);
        }
    }


    return (
        <View style={styles.sidebar} >
            <SatInfo />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: '.5em' } }>
                <Text style={[styles.satText, { alignSelf: 'center', paddingTop: 0 }]}>
                    {page * PAGE_SIZE + 1} - {(page + 1) * PAGE_SIZE > satInfo.length ? satInfo.length + 1 : (page + 1) * PAGE_SIZE} of {satInfo.length + 1 }
                </Text>
                <View style={{ flexDirection: 'row' }} >
                    <Button style={styles.button} svg={DoubleLeftChevron}   iconStyle={styles.buttonIcon} onClick={() => changePage(0)} />
                    <Button style={styles.button} svg={LeftChevron}         iconStyle={styles.buttonIcon} onClick={() => changePage(page - 1)} />
                    <Button style={styles.button} svg={RightChevron}        iconStyle={styles.buttonIcon} onClick={() => changePage(page + 1)} />
                    <Button style={styles.button} svg={DoubleRightChevron}  iconStyle={styles.buttonIcon} onClick={() => changePage(satInfo.length)} />
                </View>
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
            <View style={{ width: '75%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.satText}>Longitude:</Text>
                <Text style={styles.satText}>{(displayInfo.longitude).toFixed(2)}&#176;</Text>
            </View>
            <View style={{ width: '75%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.satText}>Latitude:</Text>
                <Text style={styles.satText}>{(displayInfo.latitude).toFixed(2)}&#176;</Text>
            </View>                      
                    
        </View>
      
    );
}

export function setSatIndex(index) {
    satInfoIndex = index;
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

            entries.push(<SatelliteInfo style={[styles.border, i > page * PAGE_SIZE ? { borderTopStyle: 'solid' } : {}]} key={i} name={satInfo[i].name} altitude={altitude} onClick={() => { satInfoIndex = i; }} />);

        }
    }

    return entries;

}

function SatelliteInfo(props) {

    const [hover, setHover] = useState(false);

    return (
        <View style={[props.style, styles.satEntry, (hover ? styles.hover : {})]} onClick={props.onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>

            <Text style={styles.infoText}>{props.name}</Text>

            {getAltitudeText(props.altitude)}

        </View>
    );
}

function getAltitudeText(altitude) {

    if      (altitude - EARTH_RADIUS < 2000)    return (<Text style={styles.leoText} >LEO</Text>);
    else if (altitude - EARTH_RADIUS < 35500)   return (<Text style={styles.meoText} >MEO</Text>);
    else if (altitude - EARTH_RADIUS < 36000)   return (<Text style={styles.geoText} >GEO</Text>);
    else                                        return (<Text style={styles.infoText}>HEO</Text>);
    
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
        cursor: 'pointer'

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
        position: 'absolute', /*remove to offset by sidebar*/
        top: 0,
        left: 0,
        width: '18em',
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

    },
    button: {
        width: '1.75em',
        height: '1.75em',
        fontSize: '1em',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#CCC'
    },
    buttonIcon: {
        fill: '#ccc'
    },
    hover: {
        backgroundColor: "#444"
    },
});
