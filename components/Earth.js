import { TextureLoader } from 'expo-three';

import { Canvas, useLoader } from '@react-three/fiber'

const earth = require('../assets/colorMap.jpg');
const earthHd = require('../assets/colorMapBig.jpg');

export default function Earth(props) {

    let colorMap = "";
    if (props.hd) {
        colorMap = useLoader(TextureLoader,
            earthHd
        );

    } else {
        colorMap = useLoader(TextureLoader,
            earthHd
        );
    }
    //repalce yaw minus with offset for teme
    return (
        <Canvas orthographic camera={{ far: 20000 }} style={{ height: `${props.height}px` }}>


            <mesh position={[0, 0, -20000]} rotation={[-props.roll + Math.PI / 2, -props.yaw, 0]}>

                <sphereGeometry args={[props.zoom * props.height / 200, 32, 32]} />


                <meshStandardMaterial color="#ddd" map={colorMap} />

            </mesh>


            <ambientLight />

        </Canvas>
    );
}











