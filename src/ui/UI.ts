
import { Text } from 'troika-three-text';
import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Line, LineBasicMaterial, OrthographicCamera, Scene, WebGLRenderer } from 'three';

import { ThreePerf } from 'three-perf/ThreePerf';

//

export class ThreePerfUI {

    public canvas: HTMLCanvasElement;
    public wrapper: HTMLElement;

    private _perf: ThreePerf;
    private _gpuValueLabel: Text;
    private _cpuValueLabel: Text;
    private _fpsValueLabel: Text;
    private _callsValueLabel: Text;
    private _trianglesValueLabel: Text;
    private _geometriesValueLabel: Text;
    private _texturesValueLabel: Text;
    private _shadersValueLabel: Text;
    private _linesValueLabel: Text;
    private _pointsValueLabel: Text;

    private _charts: Map<string, Line> = new Map();

    //

    private _renderer: WebGLRenderer;
    private _scene: Scene;
    private _camera: OrthographicCamera;

    private _width: number = 370;
    private _height: number = 110;

    //

    constructor ( props: { perf: ThreePerf, domElement: HTMLElement } ) {

        this._perf = props.perf;

        this.wrapper = document.createElement( 'div' );
        this.wrapper.id = 'three-perf-ui';
        this.wrapper.style.position = 'fixed';
        this.wrapper.style.bottom = '0';
        this.wrapper.style.left = '0';
        this.wrapper.style.width = '370px';
        this.wrapper.style.height = '110px';
        props.domElement.appendChild( this.wrapper );

        this.canvas = document.createElement( 'canvas' );
        this.canvas.width = 370;
        this.canvas.height = 110;
        this.canvas.style.position = 'absolute';
        this.wrapper.appendChild( this.canvas );

        // gpu block

        const gpuBlock = document.createElement( 'div' );
        gpuBlock.style.position = 'absolute';
        gpuBlock.style.top = '0';
        gpuBlock.style.left = '0';
        gpuBlock.style.width = '65px';
        gpuBlock.style.height = '70px';
        this.wrapper.appendChild( gpuBlock );

        const gpuLabel = document.createElement( 'div' );
        gpuLabel.style.position = 'absolute';
        gpuLabel.style.textAlign = 'right';
        gpuLabel.style.top = '22px';
        gpuLabel.style.right = '0px';
        gpuLabel.style.fontSize = '8px';
        gpuLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        gpuLabel.style.color = 'rgb(253, 151, 31)';
        gpuLabel.style.letterSpacing = '1px';
        gpuLabel.style.fontWeight = '500';
        gpuLabel.innerHTML = 'GPU';
        gpuBlock.appendChild( gpuLabel );

        const gpuMsLabel = document.createElement( 'div' );
        gpuMsLabel.style.position = 'absolute';
        gpuMsLabel.style.textAlign = 'right';
        gpuMsLabel.style.top = '7px';
        gpuMsLabel.style.right = '0px';
        gpuMsLabel.style.fontSize = '9px';
        gpuMsLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        gpuMsLabel.style.color = '#fff';
        gpuMsLabel.style.letterSpacing = '1px';
        gpuMsLabel.style.fontWeight = '500';
        gpuMsLabel.innerHTML = 'ms';
        gpuBlock.appendChild( gpuMsLabel );

        // cpu block

        const cpuBlock = document.createElement( 'div' );
        cpuBlock.style.position = 'absolute';
        cpuBlock.style.top = '0';
        cpuBlock.style.left = '70px';
        cpuBlock.style.width = '65px';
        cpuBlock.style.height = '70px';
        this.wrapper.appendChild( cpuBlock );

        const cpuLabel = document.createElement( 'div' );
        cpuLabel.style.position = 'absolute';
        cpuBlock.style.textAlign = 'right';
        cpuLabel.style.top = '22px';
        cpuLabel.style.right = '0px';
        cpuLabel.style.fontSize = '8px';
        cpuLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        cpuLabel.style.color = 'rgb(66, 226, 46)';
        cpuLabel.style.letterSpacing = '1px';
        cpuLabel.style.fontWeight = '500';
        cpuLabel.innerHTML = 'CPU';
        cpuBlock.appendChild( cpuLabel );

        const cpuMsLabel = document.createElement( 'div' );
        cpuMsLabel.style.position = 'absolute';
        cpuMsLabel.style.textAlign = 'right';
        cpuMsLabel.style.top = '7px';
        cpuMsLabel.style.right = '0px';
        cpuMsLabel.style.fontSize = '9px';
        cpuMsLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        cpuMsLabel.style.color = '#fff';
        cpuMsLabel.style.letterSpacing = '1px';
        cpuMsLabel.style.fontWeight = '500';
        cpuMsLabel.innerHTML = 'ms';
        cpuBlock.appendChild( cpuMsLabel );

        // fps block

        const fpsBlock = document.createElement( 'div' );
        fpsBlock.style.position = 'absolute';
        fpsBlock.style.top = '0';
        fpsBlock.style.left = '140px';
        fpsBlock.style.width = '45px';
        fpsBlock.style.height = '70px';
        this.wrapper.appendChild( fpsBlock );

        const fpsLabel = document.createElement( 'div' );
        fpsLabel.style.position = 'absolute';
        fpsLabel.style.width = '100%';
        fpsLabel.style.textAlign = 'right';
        fpsLabel.style.top = '22px';
        fpsLabel.style.left = '0px';
        fpsLabel.style.fontSize = '8px';
        fpsLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        fpsLabel.style.color = 'rgb(238, 38, 110)';
        fpsLabel.style.letterSpacing = '1px';
        fpsLabel.style.fontWeight = '500';
        fpsLabel.innerHTML = 'FPS';
        fpsBlock.appendChild( fpsLabel );

        // calls block

        const callsBlock = document.createElement( 'div' );
        callsBlock.style.position = 'absolute';
        callsBlock.style.top = '0';
        callsBlock.style.left = '170px';
        callsBlock.style.width = '65px';
        callsBlock.style.height = '70px';
        this.wrapper.appendChild( callsBlock );

        const callsLabel = document.createElement( 'div' );
        callsLabel.style.position = 'absolute';
        callsLabel.style.width = '100%';
        callsLabel.style.textAlign = 'right';
        callsLabel.style.top = '22px';
        callsLabel.style.right = '0px';
        callsLabel.style.fontSize = '8px';
        callsLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        callsLabel.style.color = 'rgb(101, 197, 188)';
        callsLabel.style.letterSpacing = '1px';
        callsLabel.style.fontWeight = '500';
        callsLabel.innerHTML = 'calls';
        callsBlock.appendChild( callsLabel );

        // triangles block

        const trianglesBlock = document.createElement( 'div' );
        trianglesBlock.style.position = 'absolute';
        trianglesBlock.style.top = '0';
        trianglesBlock.style.left = '250px';
        trianglesBlock.style.width = '65px';
        trianglesBlock.style.height = '70px';
        this.wrapper.appendChild( trianglesBlock );

        const trianglesLabel = document.createElement( 'div' );
        trianglesLabel.style.position = 'absolute';
        trianglesLabel.style.width = '100%';
        trianglesLabel.style.textAlign = 'right';
        trianglesLabel.style.top = '22px';
        trianglesLabel.style.right = '0px';
        trianglesLabel.style.fontSize = '8px';
        trianglesLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        trianglesLabel.style.color = 'rgb(101, 197, 188)';
        trianglesLabel.style.letterSpacing = '1px';
        trianglesLabel.style.fontWeight = '500';
        trianglesLabel.innerHTML = 'triangles';
        trianglesBlock.appendChild( trianglesLabel );

        // geometries block

        const geometriesBlock = document.createElement( 'div' );
        geometriesBlock.style.position = 'absolute';
        geometriesBlock.style.top = '30px';
        geometriesBlock.style.left = '0px';
        geometriesBlock.style.width = '65px';
        geometriesBlock.style.height = '70px';
        this.wrapper.appendChild( geometriesBlock );

        const geometriesLabel = document.createElement( 'div' );
        geometriesLabel.style.position = 'absolute';
        geometriesLabel.style.width = '100%';
        geometriesLabel.style.textAlign = 'right';
        geometriesLabel.style.top = '22px';
        geometriesLabel.style.right = '0px';
        geometriesLabel.style.fontSize = '8px';
        geometriesLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        geometriesLabel.style.color = 'rgb(101, 197, 188)';
        geometriesLabel.style.letterSpacing = '1px';
        geometriesLabel.style.fontWeight = '500';
        geometriesLabel.innerHTML = 'geometries';
        geometriesBlock.appendChild( geometriesLabel );

        // textures block

        const texturesBlock = document.createElement( 'div' );
        texturesBlock.style.position = 'absolute';
        texturesBlock.style.top = '30px';
        texturesBlock.style.left = '70px';
        texturesBlock.style.width = '65px';
        texturesBlock.style.height = '70px';
        this.wrapper.appendChild( texturesBlock );

        const texturesLabel = document.createElement( 'div' );
        texturesLabel.style.position = 'absolute';
        texturesLabel.style.width = '100%';
        texturesLabel.style.textAlign = 'right';
        texturesLabel.style.top = '22px';
        texturesLabel.style.right = '0px';
        texturesLabel.style.fontSize = '8px';
        texturesLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        texturesLabel.style.color = 'rgb(101, 197, 188)';
        texturesLabel.style.letterSpacing = '1px';
        texturesLabel.style.fontWeight = '500';
        texturesLabel.innerHTML = 'textures';
        texturesBlock.appendChild( texturesLabel );

        // shaders block

        const shadersBlock = document.createElement( 'div' );
        shadersBlock.style.position = 'absolute';
        shadersBlock.style.top = '30px';
        shadersBlock.style.left = '140px';
        shadersBlock.style.width = '65px';
        shadersBlock.style.height = '70px';
        this.wrapper.appendChild( shadersBlock );

        const shadersLabel = document.createElement( 'div' );
        shadersLabel.style.position = 'absolute';
        shadersLabel.style.width = '100%';
        shadersLabel.style.textAlign = 'right';
        shadersLabel.style.top = '22px';
        shadersLabel.style.right = '0px';
        shadersLabel.style.fontSize = '8px';
        shadersLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        shadersLabel.style.color = 'rgb(101, 197, 188)';
        shadersLabel.style.letterSpacing = '1px';
        shadersLabel.style.fontWeight = '500';
        shadersLabel.innerHTML = 'shaders';
        shadersBlock.appendChild( shadersLabel );

        // lines block

        const linesBlock = document.createElement( 'div' );
        linesBlock.style.position = 'absolute';
        linesBlock.style.top = '30px';
        linesBlock.style.left = '210px';
        linesBlock.style.width = '65px';
        linesBlock.style.height = '70px';
        this.wrapper.appendChild( linesBlock );

        const linesLabel = document.createElement( 'div' );
        linesLabel.style.position = 'absolute';
        linesLabel.style.width = '100%';
        linesLabel.style.textAlign = 'right';
        linesLabel.style.top = '22px';
        linesLabel.style.right = '0px';
        linesLabel.style.fontSize = '8px';
        linesLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        linesLabel.style.color = 'rgb(101, 197, 188)';
        linesLabel.style.letterSpacing = '1px';
        linesLabel.style.fontWeight = '500';
        linesLabel.innerHTML = 'lines';
        linesBlock.appendChild( linesLabel );

        // lines block

        const pointsBlock = document.createElement( 'div' );
        pointsBlock.style.position = 'absolute';
        pointsBlock.style.top = '30px';
        pointsBlock.style.left = '280px';
        pointsBlock.style.width = '65px';
        pointsBlock.style.height = '70px';
        this.wrapper.appendChild( pointsBlock );

        const pointsLabel = document.createElement( 'div' );
        pointsLabel.style.position = 'absolute';
        pointsLabel.style.width = '100%';
        pointsLabel.style.textAlign = 'right';
        pointsLabel.style.top = '22px';
        pointsLabel.style.right = '0px';
        pointsLabel.style.fontSize = '8px';
        pointsLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        pointsLabel.style.color = 'rgb(101, 197, 188)';
        pointsLabel.style.letterSpacing = '1px';
        pointsLabel.style.fontWeight = '500';
        pointsLabel.innerHTML = 'points';
        pointsBlock.appendChild( pointsLabel );

        this.initCanvas();

    };

    public initCanvas () : void {

        this._renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this._renderer.setClearColor( 0x000000, 0.5 );
        this._renderer.setPixelRatio( window.devicePixelRatio );
        this._renderer.setSize( 370, 110 );
        this._scene = new Scene();
        this._camera = new OrthographicCamera( 0, 370, 0, - 110, 0.1, 100 );
        this._camera.position.set( 0, 0, 10 )
        this._camera.lookAt( 0, 0, 0 );
        this._camera.updateProjectionMatrix();
        this._scene.add( this._camera );
        this._scene.userData.useStats = false;

        // init labels

        const gpuValue = new Text();
        gpuValue.anchorX = 'right';
        gpuValue.position.set( 45, - 8, 0 );
        gpuValue.text = '0.000';
        gpuValue.fontSize = 15;
        gpuValue.color = 'rgb(253, 151, 31)';
        gpuValue.sync();
        this._scene.add( gpuValue );
        this._gpuValueLabel = gpuValue;

        const cpuValue = new Text();
        cpuValue.anchorX = 'right';
        cpuValue.position.set( 115, - 8, 0 );
        cpuValue.text = '0.000';
        cpuValue.fontSize = 15;
        cpuValue.color = 'rgb(66, 226, 46)';
        cpuValue.sync();
        this._scene.add( cpuValue );
        this._cpuValueLabel = cpuValue;

        const fpsValue = new Text();
        fpsValue.anchorX = 'center';
        fpsValue.position.set( 165, - 8, 0 );
        fpsValue.text = '0';
        fpsValue.fontSize = 15;
        fpsValue.color = 'rgb(238, 38, 110)';
        fpsValue.sync();
        this._scene.add( fpsValue );
        this._fpsValueLabel = fpsValue;

        const callsValue = new Text();
        callsValue.anchorX = 'right';
        callsValue.position.set( 235, - 8, 0 );
        callsValue.text = '0';
        callsValue.fontSize = 15;
        callsValue.color = '#ffffff';
        callsValue.sync();
        this._scene.add( callsValue );
        this._callsValueLabel = callsValue;

        const trianglesValue = new Text();
        trianglesValue.anchorX = 'right';
        trianglesValue.position.set( 315, - 8, 0 );
        trianglesValue.text = '0';
        trianglesValue.fontSize = 15;
        trianglesValue.color = '#ffffff';
        trianglesValue.sync();
        this._scene.add( trianglesValue );
        this._trianglesValueLabel = trianglesValue;

        const geometriesValue = new Text();
        geometriesValue.anchorX = 'right';
        geometriesValue.position.set( 65, - 39, 0 );
        geometriesValue.text = '0';
        geometriesValue.fontSize = 15;
        geometriesValue.color = '#ffffff';
        geometriesValue.sync();
        this._scene.add( geometriesValue );
        this._geometriesValueLabel = geometriesValue;

        const texturesValue = new Text();
        texturesValue.anchorX = 'right';
        texturesValue.position.set( 135, - 39, 0 );
        texturesValue.text = '0';
        texturesValue.fontSize = 15;
        texturesValue.color = '#ffffff';
        texturesValue.sync();
        this._scene.add( texturesValue );
        this._texturesValueLabel = texturesValue;

        const shadersValue = new Text();
        shadersValue.anchorX = 'right';
        shadersValue.position.set( 205, - 39, 0 );
        shadersValue.text = '0';
        shadersValue.fontSize = 15;
        shadersValue.color = '#ffffff';
        shadersValue.sync();
        this._scene.add( shadersValue );
        this._shadersValueLabel = shadersValue;

        const linesValue = new Text();
        linesValue.anchorX = 'right';
        linesValue.position.set( 275, - 39, 0 );
        linesValue.text = '0';
        linesValue.fontSize = 15;
        linesValue.color = '#ffffff';
        linesValue.sync();
        this._scene.add( linesValue );
        this._linesValueLabel = linesValue;

        const pointsValue = new Text();
        pointsValue.anchorX = 'right';
        pointsValue.position.set( 345, - 39, 0 );
        pointsValue.text = '0';
        pointsValue.fontSize = 15;
        pointsValue.color = '#ffffff';
        pointsValue.sync();
        this._scene.add( pointsValue );
        this._pointsValueLabel = pointsValue;

        // init charts

        // gpu chart

        const gpuChartGeometry = new BufferGeometry();
        let positions = new Float32Array( 60 * 3 );

        for ( let i = 0; i < 60; i ++ ) {

            positions[ 3 * i + 0 ] = 370 / 59 * i;
            positions[ 3 * i + 1 ] = - 110;
            positions[ 3 * i + 2 ] = 0;

        }

        let positionAttribute = new BufferAttribute( positions, 3 );
        positionAttribute.usage = DynamicDrawUsage;
        gpuChartGeometry.setAttribute( 'position', positionAttribute );

        const gpuChart = new Line( gpuChartGeometry, new LineBasicMaterial({ color: 'rgb(253, 151, 31)' }) );
        this._scene.add( gpuChart );
        this._charts.set( 'gpu', gpuChart );

        // cpu chart

        const cpuChartGeometry = new BufferGeometry();
        positions = new Float32Array( 60 * 3 );

        for ( let i = 0; i < 60; i ++ ) {

            positions[ 3 * i + 0 ] = 370 / 59 * i;
            positions[ 3 * i + 1 ] = - 110;
            positions[ 3 * i + 2 ] = 0;

        }

        positionAttribute = new BufferAttribute( positions, 3 );
        positionAttribute.usage = DynamicDrawUsage;
        cpuChartGeometry.setAttribute( 'position', positionAttribute );

        const cpuChart = new Line( cpuChartGeometry, new LineBasicMaterial({ color: 'rgb(66, 226, 46)' }) );
        this._scene.add( cpuChart );
        this._charts.set( 'cpu', cpuChart );

        // fps chart

        const fpsChartGeometry = new BufferGeometry();
        positions = new Float32Array( 60 * 3 );

        for ( let i = 0; i < 60; i ++ ) {

            positions[ 3 * i + 0 ] = 370 / 59 * i;
            positions[ 3 * i + 1 ] = - 110;
            positions[ 3 * i + 2 ] = 0;

        }

        positionAttribute = new BufferAttribute( positions, 3 );
        positionAttribute.usage = DynamicDrawUsage;
        fpsChartGeometry.setAttribute( 'position', positionAttribute );

        const fpsChart = new Line( fpsChartGeometry, new LineBasicMaterial({ color: 'rgb(238, 38, 110)' }) );
        this._scene.add( fpsChart );
        this._charts.set( 'fps', fpsChart );

    };

    public update () : void {

        // update charts

        if ( this._perf.chart && this._perf.showGraph ) {

            for ( const chartName in this._perf.chart.data ) {

                const chartData = this._perf.chart.data[ chartName ];
                if ( ! this._charts.get( chartName ) || ! chartData ) continue;
                const geometry = this._charts.get( chartName )!.geometry as BufferGeometry;
                const positionAttr = geometry.attributes.position;

                let maxValue = 0;

                for ( let i = 0; i < chartData.length; i ++ ) {

                    if ( chartData[ i ] > maxValue ) maxValue = chartData[ i ];

                }

                maxValue = Math.max( maxValue, 20 );

                for ( let i = 0; i < chartData.length; i ++ ) {

                    let id = ( this._perf.chart.circularId + i + 1 ) % 60;
                    positionAttr.setY( i, chartData[ id ] / maxValue * 90 - 110 );

                }

                positionAttr.needsUpdate = true;

            }

        }

        // update labels

        this._gpuValueLabel.text = this._perf.log.gpu.toFixed( 3 );
        this._cpuValueLabel.text = this._perf.log.cpu.toFixed( 3 );
        this._fpsValueLabel.text = this._perf.log.fps.toFixed( 0 );

        this._callsValueLabel.text = this._perf.threeRenderer.info.render.calls.toString();
        this._trianglesValueLabel.text = this._perf.threeRenderer.info.render.triangles.toString();

        this._geometriesValueLabel.text = this._perf.threeRenderer.info.memory.geometries.toString();
        this._texturesValueLabel.text = this._perf.threeRenderer.info.memory.textures.toString();
        this._shadersValueLabel.text = this._perf.threeRenderer.info.programs?.length.toString() ?? '';
        this._linesValueLabel.text = this._perf.threeRenderer.info.render.lines.toString();
        this._pointsValueLabel.text = this._perf.threeRenderer.info.render.points.toString();

        // render

        this._renderer.render( this._scene, this._camera );

    };

    get width () : number {

        return this._width;

    };

    set width ( value: number ) {

        this._width = value;
        this._camera.right = value;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize( this._width, this._height );

    };

    get height () : number {

        return this._height;

    };

    set height ( value: number ) {

        this._height = value;
        this._camera.bottom = - value;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize( this._width, this._height );

    };

};
