import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ============================================================
// ESCENA
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07111f);


// ============================================================
// CÁMARA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(9, 7, 12);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(
    renderer.domElement
);


// ============================================================
// CONTROLES DE CÁMARA
// ============================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.target.set(0, 0, 0);

controls.enableRotate = true;

controls.enableZoom = true;

controls.enablePan = true;

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.minDistance = 7;

controls.maxDistance = 30;

controls.minPolarAngle = 0.1;

controls.maxPolarAngle = Math.PI - 0.1;

controls.update();


// ============================================================
// ILUMINACIÓN
// ============================================================

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        1.4
    )
);


const light = new THREE.DirectionalLight(
    0xffffff,
    3
);

light.position.set(
    5,
    8,
    6
);

scene.add(light);


// ============================================================
// VARIABLES DE LA CAJA
// ============================================================

const boxSize = 10;

const radius = 0.5;

// Límite que puede alcanzar el centro de la esfera
const limit =
    boxSize / 2 - radius;

// Posición física de las caras
const wallPosition =
    boxSize / 2;


// ============================================================
// CAJA DE CRISTAL
// ============================================================

const boxGeometry =
    new THREE.BoxGeometry(
        boxSize,
        boxSize,
        boxSize
    );


const glassMaterial =
    new THREE.MeshPhysicalMaterial({

        color: 0x8fd3ff,

        transparent: true,

        opacity: 0.18,

        transmission: 0.9,

        roughness: 0.05,

        metalness: 0,

        side: THREE.DoubleSide,

        depthWrite: false

    });


const glassBox =
    new THREE.Mesh(
        boxGeometry,
        glassMaterial
    );


scene.add(glassBox);


// ============================================================
// BORDES DE LA CAJA
// ============================================================

const edges =
    new THREE.LineSegments(

        new THREE.EdgesGeometry(
            boxGeometry
        ),

        new THREE.LineBasicMaterial({
            color: 0xbfe8ff
        })

    );


scene.add(edges);


// ============================================================
// ESFERA
// ============================================================

const sphere =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            radius,
            32,
            32
        ),

        new THREE.MeshStandardMaterial({

            color: 0xff7043,

            roughness: 0.35

        })

    );


scene.add(sphere);


// ============================================================
// VELOCIDAD DE LA ESFERA
// ============================================================

const velocity =
    new THREE.Vector3(
        0.035,
        0.027,
        0.041
    );


// ============================================================
// MARCAS DE IMPACTO
// ============================================================

// Aquí se guardan temporalmente
// todas las marcas visibles.
const impactMarks = [];


// Duración de la marca en milisegundos
const impactDuration = 800;


// ============================================================
// CREAR UNA MARCA DE IMPACTO
// ============================================================

function createImpactMark(
    position,
    axis
) {

    // --------------------------------------------------------
    // GEOMETRÍA
    // --------------------------------------------------------

    const geometry =
        new THREE.RingGeometry(
            0.12,
            0.38,
            32
        );


    // --------------------------------------------------------
    // MATERIAL
    // --------------------------------------------------------

    const material =
        new THREE.MeshBasicMaterial({

            color: 0xffd54f,

            transparent: true,

            opacity: 1,

            side: THREE.DoubleSide,

            depthWrite: false

        });


    // --------------------------------------------------------
    // CREAR MARCA
    // --------------------------------------------------------

    const mark =
        new THREE.Mesh(
            geometry,
            material
        );


    // Colocamos la marca
    // en el punto exacto del impacto.
    mark.position.copy(position);


    // --------------------------------------------------------
    // ORIENTACIÓN SEGÚN LA CARA
    // --------------------------------------------------------

    if (axis === 'x') {

        // Cara izquierda o derecha
        // El círculo debe quedar en el plano YZ.

        mark.rotation.y =
            Math.PI / 2;

    }

    else if (axis === 'y') {

        // Cara superior o inferior
        // El círculo debe quedar en el plano XZ.

        mark.rotation.x =
            Math.PI / 2;

    }

    // Para Z no necesitamos rotación,
    // RingGeometry ya está sobre el plano XY.


    // --------------------------------------------------------
    // GUARDAR MOMENTO DE CREACIÓN
    // --------------------------------------------------------

    mark.userData.createdAt =
        performance.now();


    // --------------------------------------------------------
    // AGREGAR A LA ESCENA
    // --------------------------------------------------------

    scene.add(mark);


    // Guardamos referencia para
    // poder eliminarla después.
    impactMarks.push(mark);

}


// ============================================================
// ACTUALIZAR MARCAS DE IMPACTO
// ============================================================

function updateImpactMarks() {

    const currentTime =
        performance.now();


    // Recorremos desde el final
    // para poder eliminar elementos
    // sin alterar el recorrido.
    for (
        let i = impactMarks.length - 1;
        i >= 0;
        i--
    ) {

        const mark =
            impactMarks[i];


        const elapsedTime =
            currentTime -
            mark.userData.createdAt;


        // Calculamos cuánto tiempo
        // de vida le queda.
        const progress =
            elapsedTime /
            impactDuration;


        // ----------------------------------------------------
        // DESVANECIMIENTO
        // ----------------------------------------------------

        mark.material.opacity =
            1 - progress;


        // También hacemos que crezca ligeramente
        // mientras desaparece.
        const scale =
            1 + progress * 0.7;

        mark.scale.set(
            scale,
            scale,
            scale
        );


        // ----------------------------------------------------
        // ELIMINAR MARCA
        // ----------------------------------------------------

        if (
            elapsedTime >=
            impactDuration
        ) {

            scene.remove(mark);

            mark.geometry.dispose();

            mark.material.dispose();

            impactMarks.splice(
                i,
                1
            );

        }

    }

}


// ============================================================
// ANIMACIÓN
// ============================================================

function animate() {

    // --------------------------------------------------------
    // MOVIMIENTO DE LA ESFERA
    // --------------------------------------------------------

    sphere.position.add(
        velocity
    );


    // ========================================================
    // COLISIÓN EN X
    // ========================================================

    if (
        sphere.position.x >= limit ||
        sphere.position.x <= -limit
    ) {

        // Determinamos qué pared tocó
        const side =
            sphere.position.x > 0
                ? 1
                : -1;


        // ----------------------------------------------------
        // CREAR MARCA
        // ----------------------------------------------------

        createImpactMark(

            new THREE.Vector3(

                side * wallPosition,

                sphere.position.y,

                sphere.position.z

            ),

            'x'

        );


        // ----------------------------------------------------
        // REBOTE
        // ----------------------------------------------------

        velocity.x *= -1;


        sphere.position.x =
            THREE.MathUtils.clamp(
                sphere.position.x,
                -limit,
                limit
            );

    }


    // ========================================================
    // COLISIÓN EN Y
    // ========================================================

    if (
        sphere.position.y >= limit ||
        sphere.position.y <= -limit
    ) {

        const side =
            sphere.position.y > 0
                ? 1
                : -1;


        // ----------------------------------------------------
        // CREAR MARCA
        // ----------------------------------------------------

        createImpactMark(

            new THREE.Vector3(

                sphere.position.x,

                side * wallPosition,

                sphere.position.z

            ),

            'y'

        );


        // ----------------------------------------------------
        // REBOTE
        // ----------------------------------------------------

        velocity.y *= -1;


        sphere.position.y =
            THREE.MathUtils.clamp(
                sphere.position.y,
                -limit,
                limit
            );

    }


    // ========================================================
    // COLISIÓN EN Z
    // ========================================================

    if (
        sphere.position.z >= limit ||
        sphere.position.z <= -limit
    ) {

        const side =
            sphere.position.z > 0
                ? 1
                : -1;


        // ----------------------------------------------------
        // CREAR MARCA
        // ----------------------------------------------------

        createImpactMark(

            new THREE.Vector3(

                sphere.position.x,

                sphere.position.y,

                side * wallPosition

            ),

            'z'

        );


        // ----------------------------------------------------
        // REBOTE
        // ----------------------------------------------------

        velocity.z *= -1;


        sphere.position.z =
            THREE.MathUtils.clamp(
                sphere.position.z,
                -limit,
                limit
            );

    }


    // ========================================================
    // ACTUALIZAR MARCAS
    // ========================================================

    updateImpactMarks();


    // ========================================================
    // ACTUALIZAR CÁMARA
    // ========================================================

    controls.update();


    // ========================================================
    // RENDER
    // ========================================================

    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// INICIAR ANIMACIÓN
// ============================================================

renderer.setAnimationLoop(
    animate
);


// ============================================================
// AJUSTAR TAMAÑO DE VENTANA
// ============================================================

window.addEventListener(
    'resize',
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);