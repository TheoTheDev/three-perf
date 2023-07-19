
# three-perf

**[Changelog](https://github.com/TheoTheDev/three-perf/blob/main/CHANGELOG.md)**

Easily monitor the performances of your vanilla threeJS application.

<table>
  <tr>
    <td>Add the ThreePerf component anywhere in your Canvas.</td>
    <td>
      <a href="https://wtp9t.csb.app/">
        <img src="https://github.com/TheoTheDev/three-perf/assets/1478866/66646a6a-f518-4b6d-bf11-91881b5e9be8"/>
      </a>
    </td>
  </tr>
</table>

## Installation

```bash
npm install three-perf --save-dev
```

## Options

```jsx
logsPerSecond?: number // Refresh rate of the logs [default 10]
renderer: THREE.WebGLRenderer // renderer you want to debug
domElement: HTMLElement // dom element to which stats block will be attached to
showGraph?: boolean // toggles cpu/gpu/fps graphs rendering
memory?: boolean // toggles memory info visiblity [like geos / textures / shaders etc count]
enabled?: boolean // toggles stats harvesting
visible?: boolean // stats are harvested, but stats panel is hidden
updates?: number //
actionToCallUI?: string // by default is disabled [''], but if set and type this text in the tab window three-perf dev gui will be shown
guiVisible?: boolean, // default three-perf dev gui visiblity [falde by default]
backgroundOpacity?: number // stats block background opacity level [0.7 by default]
scale?: 1 // stats block scale [default 1]
anchorX?: 'left' | 'right' // default is left [stats container horrisontal anchor]
anchorY?: 'top' | 'bottom' // default is top [stats container vertical anchor]
```

## Usage

```jsx
import { ThreePerf } from 'three-perf'

const perf = new ThreePerf({
    anchorX: 'left',
    anchorY: 'top',
    domElement: document.body, // or other canvas rendering wrapper
    renderer: renderer // three js renderer instance you use for rendering
});

function () {

    perf.begin();

    // supports composer or multy-pass rendering
    renderer.render( scene, camera );

    perf.end();

}
```

### Maintainers :

- [`twitter 🐈‍⬛ @theo_the_dev`](https://twitter.com/theo_the_dev)

### Thanks
To [`twitter @utsuboco`](https://twitter.com/utsuboco) [this is port from r3f/pref to vanilla]
