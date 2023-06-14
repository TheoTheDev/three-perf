
export class ThreePerfUI {

    public canvas: HTMLCanvasElement;
    public wrapper: HTMLElement;

    private ctx: CanvasRenderingContext2D;

    //

    constructor ( props: { domElement: HTMLElement } ) {

        this.wrapper = document.createElement( 'div' );
        this.wrapper.id = 'three-perf-ui';
        this.wrapper.style.position = 'fixed';
        this.wrapper.style.top = '0';
        this.wrapper.style.right = '0';
        this.wrapper.style.width = '370px';
        this.wrapper.style.height = '110px';
        this.wrapper.style.backgroundColor = 'rgba( 0, 0, 0, 0.5 )';
        props.domElement.appendChild( this.wrapper );

        this.canvas = document.createElement( 'canvas' );
        this.canvas.width = 370;
        this.canvas.height = 110;
        this.canvas.style.position = 'absolute';
        this.wrapper.appendChild( this.canvas );

    };

};
