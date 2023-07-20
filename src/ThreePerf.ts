
import { Pane } from 'tweakpane';
import { Camera, Mesh, Object3D, Scene, WebGLRenderer } from 'three';

import { ThreePerfUI } from './ui/UI';
import { GLPerf } from './GLPerf';
import { IChart, IGLLogger, ILogger, IProgramsPerfs } from './helpers/Types';

//

interface IThreePerfProps {
    renderer:           THREE.WebGLRenderer;
    domElement:         HTMLElement;
    overClock?:         boolean;
    logsPerSecond?:     number;
    deepAnalyze?:       boolean;
    anchorX?:           'left' | 'right';
    anchorY?:           'top' | 'bottom';
    showGraph?:         boolean;
    scale?:             number;
    memory?:            boolean;
    enabled?:           boolean;
    visible?:           boolean;
    actionToCallUI?:    string;
    guiVisible?:        boolean;
    backgroundOpacity?: number;
};

const updateMatrixWorldTemp = Object3D.prototype.updateMatrixWorld;
const updateWorldMatrixTemp = Object3D.prototype.updateWorldMatrix;
const updateMatrixTemp = Object3D.prototype.updateMatrix;

const maxGl = [ 'calls', 'triangles', 'points', 'lines' ];
const maxLog = [ 'gpu', 'cpu', 'mem', 'fps' ];

//

export class ThreePerf {

    public gui = new Pane();
    public guiFolder: any;

    public ui: ThreePerfUI;
    private perfEngine: GLPerf;

    // state
    public deepAnalyze: boolean;
    public log: any;
    public paused: boolean;
    public overclockingFps: boolean
    public fpsLimit: number;
    public startTime: number;
    public triggerProgramsUpdate: number;
    public customData: number;
    public accumulated: {
        totalFrames:    number;
        log:            ILogger;
        gl:             IGLLogger;
        max: {
            log:        ILogger
            gl:         IGLLogger
        }
    } = {
        totalFrames:        0,
        log: {
            i:              0,
            maxMemory:      0,
            gpu:            0,
            mem:            0,
            cpu:            0,
            fps:            0,
            duration:       0,
            frameCount:     0
        },
        gl: {
            calls:          0,
            triangles:      0,
            points:         0,
            lines:          0,
            counts:         0
        },
        max: {
            log: {
                i:              0,
                maxMemory:      0,
                gpu:            0,
                mem:            0,
                cpu:            0,
                fps:            0,
                duration:       0,
                frameCount:     0
            },
            gl: {
                calls:          0,
                triangles:      0,
                points:         0,
                lines:          0,
                counts:         0
            },
        }
    };
    public chart: {
        data: {
            [index: string]:    number[];
        };
        circularId:             number;
    };
    public infos: {
        version:        string;
        renderer:       string;
        vendor:         string;
    };
    public gl: WebGLRenderer;
    public programs: IProgramsPerfs;
    public objectWithMaterials: Mesh[];
    public renderPassesNumber: number = 0;

    public threeRenderer: WebGLRenderer;

    private _anchorX: 'left' | 'right';
    private _anchorY: 'top' | 'bottom';
    private _showGraph: boolean;
    private _memory: boolean;
    private _scale: number;
    private _visible: boolean;
    private _enabled: boolean;
    private _keypressed: string = '';
    private _guiVisible: boolean = true;

    public actionToCallUI: string = 'dev';

    private rendererRender: ( scene: Scene, camera: Camera ) => void;

    //

    constructor ( props: IThreePerfProps ) {

        this.deepAnalyze = props.deepAnalyze ?? false;
        this.threeRenderer = props.renderer;

        this.ui = new ThreePerfUI({ perf: this, domElement: props.domElement, backgroundOpacity: props.backgroundOpacity });

        this._visible = props.visible ?? true;
        this._enabled = props.enabled ?? true;
        this.scale = props.scale ?? 1;
        this.anchorX = props.anchorX ?? 'left';
        this.anchorY = props.anchorY ?? 'top';
        this.showGraph = props.showGraph ?? true;
        this.memory = props.memory ?? true;
        this.actionToCallUI = props.actionToCallUI ?? '';
        this.guiVisible = props.guiVisible ?? false;
        this.gui.element.parentElement!.style.width = '300px';

        window.addEventListener( 'keypress', this.keypressHandler );

        //

        const overClock = props.overClock ?? true;

        this.perfEngine = new GLPerf({
            perf:           this,
            trackGPU:       true,
            overClock:      overClock,
            chartLen:       120, // chart ? chart.length : 120,
            chartHz:        60, // chart ? chart.hz : 60,
            logsPerSecond:  props.logsPerSecond ?? 10,
            gl:             props.renderer.getContext() as WebGL2RenderingContext,
            chartLogger: ( chart: IChart ) => {

                this.chart = chart;

            },
            paramLogger: ( logger: any ) => {

                if ( ! this._enabled ) return;

                const log = {
                    maxMemory:      logger.maxMemory,
                    gpu:            logger.gpu,
                    cpu:            logger.cpu,
                    mem:            logger.mem,
                    fps:            logger.fps,
                    totalTime:      logger.duration,
                    frameCount:     logger.frameCount,
                };

                this.log = log;

                const accumulated: any = this.accumulated;
                const glRender: any = this.threeRenderer.info.render;

                accumulated.totalFrames ++;
                accumulated.gl.calls += glRender.calls;
                accumulated.gl.triangles += glRender.triangles;
                accumulated.gl.points += glRender.points;
                accumulated.gl.lines += glRender.lines;

                accumulated.log.gpu += logger.gpu;
                accumulated.log.cpu += logger.cpu;
                accumulated.log.mem += logger.mem;
                accumulated.log.fps += logger.fps;

                // calculate max

                for ( let i = 0; i < maxGl.length; i ++ ) {

                    const key = maxGl[ i ];
                    const value = glRender[ key ];

                    if ( value > accumulated.max.gl[ key ] ) {

                        accumulated.max.gl[ key ] = value;

                    }

                }

                for ( let i = 0; i < maxLog.length; i ++ ) {

                    const key = maxLog[ i ];
                    const value = logger[ key ];

                    if ( value > accumulated.max.log[ key ] ) {

                        accumulated.max.log[ key ] = value;

                    }

                }

                // TODO CONVERT TO OBJECT AND VALUE ALWAYS 0 THIS IS NOT CALL
                this.accumulated = accumulated;
                this.ui.update();

            }
        });

        // Infos

        const ctx = props.renderer.getContext();
        let glRenderer = null;
        let glVendor = null;

        const rendererInfo: any = ctx.getExtension( 'WEBGL_debug_renderer_info' );
        const glVersion = ctx.getParameter( ctx.VERSION );

        if ( rendererInfo != null ) {

            glRenderer = ctx.getParameter( rendererInfo.UNMASKED_RENDERER_WEBGL );
            glVendor = ctx.getParameter( rendererInfo.UNMASKED_VENDOR_WEBGL );

        }

        if ( ! glVendor ) {

            glVendor = 'Unknown vendor';

        }

        if ( ! glRenderer ) {

            glRenderer = ctx.getParameter( ctx.RENDERER );

        }

        //

        this.startTime = performance.now();

        this.infos = {
            version:    glVersion,
            renderer:   glRenderer,
            vendor:     glVendor
        };

        this.rendererRender = this.threeRenderer.render;
        this.threeRenderer.info.autoReset = false;

        this.threeRenderer.render = ( scene: Scene, camera: Camera ) => {

            this.renderPassesNumber ++;
            this.rendererRender.call( this.threeRenderer, scene, camera );

        };

        // add three perf pane

        // @ts-ignore
        this.guiFolder = this.gui.addFolder({ title: 'Settings' });
        const perfFolder = this.guiFolder.addFolder({ title: 'ThreePerf' });
        perfFolder.addInput( this, 'visible', { label: 'Visible' } );
        perfFolder.addInput( this, 'enabled', { label: 'Enabled' } );
        perfFolder.addInput( this, 'anchorX', { label: 'xAnchor', options: { left: 'left', right: 'right' } });
        perfFolder.addInput( this, 'anchorY', { label: 'yAnchor', options: { top: 'top', bottom: 'bottom' } });
        perfFolder.addInput( this, 'backgroundOpacity', { label: 'Background opacity', min: 0, max: 1, step: 0.1 } );
        perfFolder.addInput( this, 'memory', { label: 'Memory' } );
        perfFolder.addInput( this, 'showGraph', { label: 'Charts' } );
        perfFolder.addInput( this, 'scale', { label: 'Scale', min: 0.1, max: 2, step: 0.1 } );
        perfFolder.addInput( this, 'logsPerSecond', { label: 'LogsPerSecond', min: 1, max: 60, step: 1 } );

        //

        console.log( 'ThreePerf inited.' );

    };

    public begin () {

        this.perfEngine.begin( 'profiler' );

    };

    public end () {

        this.afterRender();
        this.renderPassesNumber = 0;
        this.threeRenderer.info.reset();

    };

    public dispose () {

        this.ui.dispose();
        this.gui.element.parentElement?.remove();
        window.removeEventListener( 'keypress', this.keypressHandler );

    };

    //

    private keypressHandler = ( event: KeyboardEvent ) : void => {

        if ( ! this.actionToCallUI ) return;

        this._keypressed += event.key;
        const keys = this._keypressed.split('');

        while ( keys.length > this.actionToCallUI.length ) {

            keys.shift();

        }

        if ( keys.join('') === this.actionToCallUI ) {

            this._keypressed = '';
            this.guiVisible = ! this.guiVisible;

        }

    };

    private afterRender = () => {

        if ( ! this._enabled ) return;

        if ( ! this.perfEngine.paused ) {

            this.perfEngine.nextFrame( window.performance.now() );

            if ( this.perfEngine.overClock && typeof window.requestIdleCallback !== 'undefined' ) {

                this.perfEngine.idleCbId = requestIdleCallback( this.perfEngine.nextFps );

            }

        }

        if ( this.perfEngine ) {

            this.perfEngine.end( 'profiler' );

        }

        if ( window.performance ) {

            window.performance.mark( 'cpu-started' );
            this.perfEngine.startCpuProfiling = true;

        }

        if ( this.deepAnalyze ) {

            // todo

        }

    };

    //

    get enabled () {

        return this._enabled;

    };

    set enabled ( value: boolean ) {

        this._enabled = value;

    };

    get visible () {

        return this._visible;

    };

    set visible ( value: boolean ) {

        this._visible = value;
        this.ui.toggleVisibility( value );

    };

    get guiVisible () {

        return this._guiVisible;

    };

    set guiVisible ( value: boolean ) {

        this._guiVisible = value;
        this.gui.element.parentElement!.style['display'] = value ? 'block' : 'none';

    };

    get anchorX () {

        return this._anchorX;

    };

    set anchorX ( value: 'left' | 'right' ) {

        this._anchorX = value;

        if ( this._anchorX === 'left' ) {

            this.ui.wrapper.style.left = '0';
            this.ui.wrapper.style.right = '';

        } else {

            this.ui.wrapper.style.left = '';
            this.ui.wrapper.style.right = '0';

        }

    };

    get anchorY () {

        return this._anchorY;

    };

    set anchorY ( value: 'top' | 'bottom' ) {

        this._anchorY = value;

        if ( this._anchorY === 'top' ) {

            this.ui.wrapper.style.top = '0';
            this.ui.wrapper.style.bottom = '';

        } else {

            this.ui.wrapper.style.top = '';
            this.ui.wrapper.style.bottom = '0';

        }

    };

    get showGraph () {

        return this._showGraph;

    };

    set showGraph ( value: boolean ) {

        this._showGraph = value;
        this.ui.toggleCharts( value );

    };

    get memory () {

        return this._memory;

    };

    set memory ( value: boolean ) {

        this._memory = value;
        this.ui.toggleMemoryInfo( value );

    };

    get scale () {

        return this._scale;

    };

    set scale ( value: number ) {

        this._scale = value;
        this.ui.setScale( value );

    };

    get logsPerSecond () {

        return this.perfEngine.logsPerSecond;

    };

    set logsPerSecond ( value: number ) {

        this.perfEngine.logsPerSecond = value;

    };

    get backgroundOpacity () {

        return this.ui._backgroundOpacity;

    };

    set backgroundOpacity ( value: number ) {

        this.ui.setBackgroundOpacity( value );

    };

};
