
import { Material, Mesh } from 'three';

//

interface IDrawCount {
    type:           string;
    drawCount:      number;
};

export type IDrawCounts = {
    total:      number;
    type:       string;
    data:       IDrawCount[];
};

export type IProgramsPerf = {
    meshes?: {
        [index: string]:    Mesh[];
    }
    material:               Material;
    program?:               WebGLProgram;
    visible:                boolean;
    drawCounts:             IDrawCounts;
    expand:                 boolean;
};

export type IProgramsPerfs = Map<string, IProgramsPerf>;

export type ILogger = {
    i:              number;
    maxMemory:      number;
    gpu:            number;
    mem:            number;
    cpu:            number;
    fps:            number;
    duration:       number;
    frameCount:     number;
};

export type IGLLogger = {
    calls:          number;
    triangles:      number;
    points:         number;
    lines:          number;
    counts:         number;
};

export interface ILogsAccums {
    mem:            number[];
    gpu:            number[];
    cpu:            number[];
    fps:            number[];
    fpsFixed:       number[];
};

export type IChart = {
    data: {
        [index: string]:    number[];
    };
    id:                     number;
    circularId:             number;
};
