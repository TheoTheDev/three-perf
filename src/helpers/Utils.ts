
export const isUUID = ( uuid: string ) : boolean => {

    let s: any = '' + uuid;

    s = s.match( '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' );

    if ( s === null ) {

        return false;

    }

    return true;

};

export const addMuiPerfID = ( material: THREE.Material, currentObjectWithMaterials: any ) : string => {

    if ( ! material.defines ) {

        material.defines = {};

    }

    if ( material.defines && !material.defines.muiPerf ) {

        material.defines = Object.assign( material.defines || {}, { muiPerf: material.uuid } );

    }

    const uuid = material.uuid;

    if ( ! currentObjectWithMaterials[ uuid ] ) {

        currentObjectWithMaterials[ uuid ] = {
            meshes: {},
            material: material,
        };

        material.needsUpdate = true;

    }

    material.needsUpdate = false;

    return uuid;

};

export const getMUIIndex = (muid: string) => muid === 'muiPerf';
