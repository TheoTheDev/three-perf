
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { ThreePerf } from 'three-perf';

//

window.onload = () => {

    const clock = new THREE.Clock();
    const canvas = document.getElementById( 'renderport' );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( 0x222222, 1 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 50 );
    camera.position.set( 10, 10, 10 );
    camera.lookAt( 0, 0, 0 );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.target.set( 0, 0, - 0.2 );
    controls.update();

    const spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 15, 15, 15 );
    spotLight.lookAt( 0, 0, 0 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 500;
    scene.add( spotLight );

    const cubes = [];
    const cubesWrapper = new THREE.Object3D();
    scene.add( cubesWrapper );

    // add scene ground

    const ground = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 1, 1 ), new THREE.MeshPhongMaterial({ color: 0x222222 }) );
    ground.rotation.x -= Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );

    // postprocessing

    const composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );

    const effect1 = new ShaderPass( RGBShiftShader );
    effect1.uniforms[ 'amount' ].value = 0.0015;
    composer.addPass( effect1 );

    const effect2 = new OutputPass();
    composer.addPass( effect2 );

    // add perf monitor

    const perfMonitor = new ThreePerf({
        showGraph:      true,
        renderer:       renderer,
        domElement:     document.body,
        scale:          1,
        guiVisible:     true,
        actionToCallUI: 'gui'
    });

    const params = {
        cubeCount:          2000,
        postprocessing:     true,
        shadow:             true
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
            cube.castShadow = true;
            cubesWrapper.add( cube );
            cubes.push( cube );

        }

    };

    const resize = () => {

        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        composer.setSize( window.innerWidth, window.innerHeight );

    };

    const render = () => {

        perfMonitor.begin();

        const delta = clock.getDelta();
        requestAnimationFrame( render );
        controls.update( delta );

        cubes.forEach( ( cube ) => {

            cube.rotation.x += 0.01;
            cube.rotation.z += 0.01;
            cube.castShadow = params.shadow;

        });

        renderer.shadowMap.enabled = params.shadow;
        spotLight.castShadow = params.shadow;

        if ( params.postprocessing ) {

            composer.render();

        } else {

            renderer.render( scene, camera );

        }

        perfMonitor.end();

    };

    //

    const exampleFolder = perfMonitor.guiFolder.addFolder({ title: 'Example' });
    exampleFolder.addInput( params, 'cubeCount', { label: 'Cubes', min: 1, max: 10000, step: 1 } ).on( 'change', regenateCubes );
    exampleFolder.addInput( params, 'postprocessing', { label: 'Postprocessing' } );
    exampleFolder.addInput( params, 'shadow', { label: 'Shadow' } );
    exampleFolder.addButton({ title: 'Dispose perf' }).on( 'click', () => perfMonitor.dispose() );

    //

    window.addEventListener( 'resize', resize );

    regenateCubes();
    resize();
    render();

};
