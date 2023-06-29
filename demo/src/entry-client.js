
import * as THREE from 'three';

import { ThreePerf } from 'three-perf';
import { Pane } from 'tweakpane';

//

window.onload = () => {

    const canvas = document.getElementById( 'renderport' );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor( 0x222222, 1 );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 50 );
    camera.position.set( 10, 10, 10 );
    camera.lookAt( 0, 0, 0 );

    const spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 15, 15, 15 );
    spotLight.lookAt( 0, 0, 0 );
    scene.add( spotLight );

    const cubes = [];
    const cubesWrapper = new THREE.Object3D();
    scene.add( cubesWrapper );

    const perfMonitor = new ThreePerf({
        showGraph: true,
        scene,
        renderer: renderer,
        domElement: document.body,
        scale: 2
    });

    const gui = new Pane();
    const params = {
        cubeCount: 2000
    };

    //

    const regenateCubes = () => {

        cubesWrapper.children.length = 0;
        cubes.length = 0;

        for ( let i = 0; i < params.cubeCount; i ++ ) {

            const cube = new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.2, 1, 1, 1 ), new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, color: 0x00ff00 * Math.random() }) );
            cube.position.set( ( Math.random() - 0.5 ) * 22, ( Math.random() - 0.5 ) * 22, ( Math.random() - 0.5 ) * 22 );
            cube.rotation.x += Math.random() * Math.PI * 2;
            cube.rotation.z += Math.random() * Math.PI * 2;
            cubesWrapper.add( cube );
            cubes.push( cube );

        }

    };

    const resize = () => {

        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

    };

    const render = () => {

        requestAnimationFrame( render );

        cubes.forEach( ( cube ) => {

            cube.rotation.x += 0.01;
            cube.rotation.z += 0.01;

        });

        renderer.render( scene, camera );

    };

    //

    const perfFolder = gui.addFolder({ title: 'ThreePerf' });
    perfFolder.addInput( perfMonitor, 'visible', { label: 'Visible' } );
    perfFolder.addInput( perfMonitor, 'enabled', { label: 'Enabled' } );
    perfFolder.addInput( perfMonitor, 'anchorX', { label: 'xAnchor', options: { left: 'left', right: 'right' } });
    perfFolder.addInput( perfMonitor, 'anchorY', { label: 'yAnchor', options: { top: 'top', bottom: 'bottom' } });
    perfFolder.addInput( perfMonitor, 'memory', { label: 'Memory' } );
    perfFolder.addInput( perfMonitor, 'showGraph', { label: 'Charts' } );
    perfFolder.addInput( perfMonitor, 'scale', { label: 'Scale', min: 0.1, max: 2, step: 0.1 } );
    perfFolder.addInput( perfMonitor, 'updates', { label: 'Updates', min: 1, max: 60, step: 1 } );

    const exampleFolder = gui.addFolder({ title: 'Example' });
    exampleFolder.addInput( params, 'cubeCount', { label: 'Cubes', min: 1, max: 10000, step: 1 } ).on( 'change', regenateCubes );

    //

    window.addEventListener( 'resize', resize );

    regenateCubes();
    resize();
    render();

};
