import { TextureLoader } from 'expo-three';

import { Canvas, useLoader } from '@react-three/fiber'

const earth = require('../assets/colorMap.jpg');
const earthHD = require('../assets/colorMapBig.jpg');
const grayMap = require('../assets/greyMap.png');

const MAPS = {
    color: 0,
    gray: 1
}

export default function Earth(props) {

    let [colorMap, colorMapGray] = useLoader(TextureLoader,
        [earth, grayMap]
    );

    let map = props.map ? colorMapGray : colorMap;
    //repalce yaw minus with offset for teme
    return (
        <Canvas orthographic camera={{ far: 20000 }} style={{ height: `${props.height}px` }}>

            <mesh position={[0, 0, -20000]} rotation={[-props.roll + Math.PI / 2, -props.yaw, 0]}>

                <sphereGeometry args={[props.zoom * props.height / 200, 32, 32]} />

                <meshStandardMaterial color="#ddd" map={map} />

            </mesh>

            <ambientLight />

        </Canvas>
    );
}











