
import { Mesh, Object3D, Scene, WebGLRenderer } from 'three';

import { ThreePerfUI } from './ui/UI';
import { GLPerf } from './GLPerf';
import { IChart, IGLLogger, ILogger, IProgramsPerfs } from './helpers/Types';

//

interface IThreePerfProps {
    renderer:       THREE.WebGLRenderer;
    domElement:     HTMLElement;
    overClock?:     boolean;
    logsPerSecond?: number;
    deepAnalyze?:   boolean;
};

const updateMatrixWorldTemp = Object3D.prototype.updateMatrixWorld;
const updateWorldMatrixTemp = Object3D.prototype.updateWorldMatrix;
const updateMatrixTemp = Object3D.prototype.updateMatrix;

const maxGl = [ 'calls', 'triangles', 'points', 'lines' ];
const maxLog = [ 'gpu', 'cpu', 'mem', 'fps' ];

//

export class ThreePerf {

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
    chart: {
        data: {
            [index: string]:    number[];
        };
        circularId:             number;
    };
    infos: {
        version:        string;
        renderer:       string;
        vendor:         string;
    };
    gl: WebGLRenderer;
    scene: Scene;
    programs: IProgramsPerfs;
    objectWithMaterials: Mesh[];

    threeRenderer: WebGLRenderer;

    //

    constructor ( props: IThreePerfProps ) {

        this.deepAnalyze = props.deepAnalyze ?? false;
        this.threeRenderer = props.renderer;

        this.ui = new ThreePerfUI({ domElement: props.domElement });

        //

        const logsPerSecond = props.logsPerSecond ?? 10;
        const overClock = props.overClock ?? true;

        this.perfEngine = new GLPerf({
            perf:           this,
            trackGPU:       true,
            overClock:      overClock,
            // chartLen:       chart ? chart.length : 120,
            // chartHz:        chart ? chart.hz : 60,
            logsPerSecond:  logsPerSecond || 10,
            gl:             props.renderer.getContext() as WebGL2RenderingContext,
            chartLogger: ( chart: IChart ) => {

                this.chart = chart;

            },
            paramLogger: ( logger: any ) => {

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

                // emitEvent('log', [log, gl])

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

        this.startTime = performance.now();

        this.infos = {
            version:    glVersion,
            renderer:   glRenderer,
            vendor:     glVendor
        };

        const callbacks = new Map();
        const callbacksAfter = new Map();
        const scope = this;

        Object.defineProperty( Scene.prototype, 'onBeforeRender', {
            get () {

                return ( ...args: any ) => {

                    if ( scope.perfEngine ) {

                        scope.perfEngine.begin( 'profiler' );

                    }

                    callbacks.get( this )?.( ...args );

                };

            },
            set( callback ) {

                callbacks.set( this, callback );

            },
            configurable: true
        });

        Object.defineProperty( Scene.prototype, 'onAfterRender', {
            get () {

                return ( ...args: any ) => {

                    if ( scope.perfEngine ) {

                        scope.perfEngine.end( 'profiler' );

                    }

                    scope.afterRender();
                    callbacksAfter.get( this )?.( ...args );

                };

            },
            set ( callback ) {

                callbacksAfter.set( this, callback );

            },
            configurable: true
        });

        //

        console.log( 'ThreePerf inited.' );

    };

    //

    private afterRender = () => {

        if ( ! this.perfEngine.paused ) {

            this.perfEngine.nextFrame( window.performance.now() );

            if ( this.perfEngine.overClock && typeof window.requestIdleCallback !== 'undefined' ) {

                this.perfEngine.idleCbId = requestIdleCallback( this.perfEngine.nextFps );

            }

        }

        if ( this.deepAnalyze ) {

            // todo

        }

    };

};
