import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import WAVES from 'vanta/dist/vanta.waves.min';

const useVanta = (ref) => {
    const vantaEffect = useRef(null);

    useEffect(() => {
        if (!vantaEffect.current && ref.current) {
            vantaEffect.current = WAVES({
                el: ref.current,
                THREE,
                mouseControls: true,
                touchControls: false,
                gyroControls: false,
                // Match the classical wood/parchment theme precisely
                color: 0x5c3b21,
                backgroundColor: 0x2b1d12,
                shininess: 25,
                waveHeight: 20,
                waveSpeed: 0.5,
                zoom: 0.9,
            });
        }

        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
                vantaEffect.current = null;
            }
        };
    }, [ref]);
};

export default useVanta;
