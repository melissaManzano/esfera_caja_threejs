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

document.body.appendChild(renderer.domElement);


// ============================================================
// CONTROLES DE CÁMARA
// ============================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

// Punto alrededor del cual girará la cámara
controls.target.set(0, 0, 0);

// Permitir rotación
controls.enableRotate = true;

// Permitir zoom con la rueda del mouse
controls.enableZoom = true;

// Permitir desplazamiento con clic derecho
controls.enablePan = true;

// Movimiento más suave
controls.enableDamping = true;

// Cantidad de suavizado
controls.dampingFactor = 0.05;

// Distancia mínima de la cámara
controls.minDistance = 7;

// Distancia máxima de la cámara
controls.maxDistance = 30;

// Evita que la cámara pueda voltearse completamente
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

light.position.set(5, 8, 6);

scene.add(light);


// ============================================================
// VARIABLES DE LA CAJA
// ============================================================

const boxSize = 10;

const radius = 0.5;

const limit =
    boxSize / 2 - radius;


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
// ANIMACIÓN
// ============================================================

function animate() {

    // --------------------------------------------------------
    // MOVIMIENTO DE LA ESFERA
    // --------------------------------------------------------

    sphere.position.add(
        velocity
    );


    // --------------------------------------------------------
    // COLISIÓN EN X
    // --------------------------------------------------------

    if (
        sphere.position.x >= limit ||
        sphere.position.x <= -limit
    ) {

        velocity.x *= -1;

        sphere.position.x =
            THREE.MathUtils.clamp(
                sphere.position.x,
                -limit,
                limit
            );

    }


    // --------------------------------------------------------
    // COLISIÓN EN Y
    // --------------------------------------------------------

    if (
        sphere.position.y >= limit ||
        sphere.position.y <= -limit
    ) {

        velocity.y *= -1;

        sphere.position.y =
            THREE.MathUtils.clamp(
                sphere.position.y,
                -limit,
                limit
            );

    }


    // --------------------------------------------------------
    // COLISIÓN EN Z
    // --------------------------------------------------------

    if (
        sphere.position.z >= limit ||
        sphere.position.z <= -limit
    ) {

        velocity.z *= -1;

        sphere.position.z =
            THREE.MathUtils.clamp(
                sphere.position.z,
                -limit,
                limit
            );

    }


    // --------------------------------------------------------
    // ACTUALIZAR CONTROLES DE CÁMARA
    // --------------------------------------------------------

    controls.update();


    // --------------------------------------------------------
    // RENDERIZAR ESCENA
    // --------------------------------------------------------

    renderer.render(
        scene,
        camera
    );

}


renderer.setAnimationLoop(
    animate
);


// ============================================================
// AJUSTAR PANTALLA AL CAMBIAR TAMAÑO DE VENTANA
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