
declare namespace Troika {
    class Text extends THREE.Object3D {
        text: string;
        anchorX: string;
        position: THREE.Vector3;
        fontSize: number;
        color: string;
        sync () : void;
    }
}

declare module 'troika-three-text' {
    export = Troika;
}
