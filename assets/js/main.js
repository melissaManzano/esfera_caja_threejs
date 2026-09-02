import * as THREE from 'three';

import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';


// ============================================================
// ESCENA
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x07111f);


// ============================================================
// CÁMARA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

camera.position.set(
    9,
    7,
    12
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


// Activar sombras
renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


document.body.appendChild(
    renderer.domElement
);


// ============================================================
// CONTROLES DE CÁMARA
// ============================================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.target.set(
    0,
    0,
    0
);

controls.enableRotate = true;

controls.enableZoom = true;

controls.enablePan = true;

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.minDistance = 7;

controls.maxDistance = 30;

controls.update();


// ============================================================
// ILUMINACIÓN AMBIENTAL
// ============================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.2
    );

scene.add(
    ambientLight
);


// ============================================================
// LUZ DIRECCIONAL
// ============================================================

const light =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

light.position.set(
    5,
    10,
    6
);


// Activar sombras de esta luz
light.castShadow = true;


// Resolución de las sombras
light.shadow.mapSize.width = 2048;

light.shadow.mapSize.height = 2048;


// Área cubierta por las sombras
light.shadow.camera.left = -12;

light.shadow.camera.right = 12;

light.shadow.camera.top = 12;

light.shadow.camera.bottom = -12;


scene.add(
    light
);


// ============================================================
// CONFIGURACIÓN DE LA CAJA
// ============================================================

const boxSize = 10;

const sphereRadius = 0.5;


// Posición física de las paredes
const wallPosition =
    boxSize / 2;


// Límite para el centro
// de las esferas
const limit =
    wallPosition -
    sphereRadius;


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

        side:
            THREE.DoubleSide,

        depthWrite: false

    });


const glassBox =
    new THREE.Mesh(
        boxGeometry,
        glassMaterial
    );


scene.add(
    glassBox
);


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


scene.add(
    edges
);


// ============================================================
// PLANO TIPO ALFOMBRA
// ============================================================

// El plano será más grande que la caja.
const carpetSize = 17;


// ============================================================
// GEOMETRÍA DE LA ALFOMBRA
// ============================================================

// Utilizamos bastantes segmentos porque
// vamos a modificar ligeramente sus vértices.
const carpetGeometry =
    new THREE.PlaneGeometry(
        carpetSize,
        carpetSize,
        100,
        100
    );


// ============================================================
// TEXTURA PROCEDURAL
// ============================================================

// Obtenemos las posiciones de los vértices
// del plano.
const carpetPositions =
    carpetGeometry.attributes.position;


// Recorremos todos los vértices.
for (
    let i = 0;
    i < carpetPositions.count;
    i++
) {

    const x =
        carpetPositions.getX(i);

    const y =
        carpetPositions.getY(i);


    // --------------------------------------------------------
    // ONDAS PEQUEÑAS
    // --------------------------------------------------------

    // Primera variación
    const wave1 =
        Math.sin(
            x * 5
        ) * 0.018;


    // Segunda variación
    const wave2 =
        Math.cos(
            y * 6
        ) * 0.015;


    // Variación diagonal
    const wave3 =
        Math.sin(
            (x + y) * 9
        ) * 0.009;


    // --------------------------------------------------------
    // IRREGULARIDAD ADICIONAL
    // --------------------------------------------------------

    // Una pequeña variación utilizando
    // diferentes frecuencias.
    const detail =
        Math.sin(
            x * 13 +
            y * 11
        ) * 0.005;


    // --------------------------------------------------------
    // ALTURA FINAL
    // --------------------------------------------------------

    const height =
        wave1 +
        wave2 +
        wave3 +
        detail;


    carpetPositions.setZ(
        i,
        height
    );

}


// Indicamos a Three.js que
// modificamos los vértices.
carpetPositions.needsUpdate =
    true;


// Recalculamos las normales para que
// las irregularidades reaccionen
// correctamente a la iluminación.
carpetGeometry.computeVertexNormals();


// ============================================================
// MATERIAL DE LA ALFOMBRA
// ============================================================

const carpetMaterial =
    new THREE.MeshStandardMaterial({

        // Rosa mate
        color: 0xd989a7,

        // Muy poca reflexión
        roughness: 0.97,

        // No es metálico
        metalness: 0,

        side:
            THREE.DoubleSide

    });


// ============================================================
// CREAR ALFOMBRA
// ============================================================

const carpet =
    new THREE.Mesh(
        carpetGeometry,
        carpetMaterial
    );


// PlaneGeometry originalmente está
// orientado hacia el eje Z.
// Lo colocamos horizontal.
carpet.rotation.x =
    -Math.PI / 2;


// Colocar debajo de la caja.
carpet.position.y =
    -boxSize / 2 -
    0.08;


// Recibir sombras
carpet.receiveShadow = true;


scene.add(
    carpet
);


// ============================================================
// COLORES DE LAS ESFERAS
// ============================================================

// Color normal
const normalColor =
    new THREE.Color(
        0xff7043
    );


// Color cuando ocurre una colisión
const collisionColor =
    new THREE.Color(
        0xffff00
    );


// Tiempo durante el cual
// permanece el color de colisión.
const collisionColorDuration =
    180;


// ============================================================
// ESFERAS
// ============================================================

const spheres = [];


// Geometría compartida
// entre todas las esferas.
const sphereGeometry =
    new THREE.SphereGeometry(
        sphereRadius,
        32,
        32
    );


// ============================================================
// VELOCIDADES GLOBALES
// ============================================================

let speedXValue = 0.035;

let speedYValue = 0.027;

let speedZValue = 0.041;


// ============================================================
// GENERAR SIGNO ALEATORIO
// ============================================================

function randomSign() {

    return Math.random() < 0.5
        ? -1
        : 1;

}


// ============================================================
// COMPROBAR SI UNA POSICIÓN ESTÁ DISPONIBLE
// ============================================================

function positionIsAvailable(
    position
) {

    for (
        const sphere of spheres
    ) {

        const distance =
            position.distanceTo(
                sphere.mesh.position
            );


        if (
            distance <
            sphereRadius * 2.2
        ) {

            return false;

        }

    }


    return true;

}


// ============================================================
// CREAR POSICIÓN ALEATORIA
// ============================================================

function createRandomPosition() {

    const position =
        new THREE.Vector3();


    let attempts = 0;


    do {

        position.set(

            THREE.MathUtils.randFloat(
                -limit,
                limit
            ),

            THREE.MathUtils.randFloat(
                -limit,
                limit
            ),

            THREE.MathUtils.randFloat(
                -limit,
                limit
            )

        );


        attempts++;

    }

    while (

        !positionIsAvailable(
            position
        )

        &&

        attempts < 100

    );


    return position;

}


// ============================================================
// CREAR ESFERA
// ============================================================

function createSphere() {

    // --------------------------------------------------------
    // MATERIAL
    // --------------------------------------------------------

    const material =
        new THREE.MeshStandardMaterial({

            color:
                normalColor.clone(),

            roughness:
                0.35

        });


    // --------------------------------------------------------
    // MESH
    // --------------------------------------------------------

    const mesh =
        new THREE.Mesh(
            sphereGeometry,
            material
        );


    // Posición aleatoria
    mesh.position.copy(
        createRandomPosition()
    );


    // La esfera genera sombra
    mesh.castShadow = true;


    // También puede recibir sombra
    mesh.receiveShadow = true;


    scene.add(
        mesh
    );


    // --------------------------------------------------------
    // OBJETO DE DATOS
    // --------------------------------------------------------

    const sphereObject = {

        mesh: mesh,

        velocity:
            new THREE.Vector3(

                speedXValue *
                randomSign(),

                speedYValue *
                randomSign(),

                speedZValue *
                randomSign()

            ),

        collisionUntil: 0

    };


    spheres.push(
        sphereObject
    );

}


// ============================================================
// ELIMINAR ESFERA
// ============================================================

function removeSphere() {

    if (
        spheres.length === 0
    ) {

        return;

    }


    const sphere =
        spheres.pop();


    scene.remove(
        sphere.mesh
    );


    sphere.mesh.material.dispose();

}


// ============================================================
// CAMBIAR CANTIDAD DE ESFERAS
// ============================================================

function setSphereCount(
    amount
) {

    // Agregar
    while (
        spheres.length <
        amount
    ) {

        createSphere();

    }


    // Eliminar
    while (
        spheres.length >
        amount
    ) {

        removeSphere();

    }

}


// ============================================================
// MOSTRAR COLISIÓN
// ============================================================

function showCollision(
    sphere
) {

    sphere.collisionUntil =

        performance.now() +

        collisionColorDuration;


    sphere.mesh.material.color.copy(
        collisionColor
    );

}


// ============================================================
// ACTUALIZAR COLORES
// ============================================================

function updateCollisionColors() {

    const currentTime =
        performance.now();


    for (
        const sphere of spheres
    ) {

        if (
            currentTime >
            sphere.collisionUntil
        ) {

            sphere.mesh.material.color.copy(
                normalColor
            );

        }

    }

}


// ============================================================
// MARCAS DE IMPACTO
// ============================================================

const impactMarks = [];

const impactDuration =
    700;


// ============================================================
// CREAR MARCA DE IMPACTO
// ============================================================

function createImpactMark(
    position,
    axis
) {

    const geometry =
        new THREE.RingGeometry(
            0.12,
            0.38,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({

            color:
                0xffd54f,

            transparent:
                true,

            opacity:
                1,

            side:
                THREE.DoubleSide,

            depthWrite:
                false

        });


    const mark =
        new THREE.Mesh(
            geometry,
            material
        );


    mark.position.copy(
        position
    );


    // --------------------------------------------------------
    // ORIENTACIÓN SEGÚN LA CARA
    // --------------------------------------------------------

    if (
        axis === 'x'
    ) {

        mark.rotation.y =
            Math.PI / 2;

    }


    else if (
        axis === 'y'
    ) {

        mark.rotation.x =
            Math.PI / 2;

    }


    mark.userData.createdAt =
        performance.now();


    scene.add(
        mark
    );


    impactMarks.push(
        mark
    );

}


// ============================================================
// ACTUALIZAR MARCAS
// ============================================================

function updateImpactMarks() {

    const currentTime =
        performance.now();


    for (

        let i =
            impactMarks.length - 1;

        i >= 0;

        i--

    ) {

        const mark =
            impactMarks[i];


        const elapsed =
            currentTime -
            mark.userData.createdAt;


        const progress =
            elapsed /
            impactDuration;


        // ----------------------------------------------------
        // DESVANECER
        // ----------------------------------------------------

        mark.material.opacity =
            Math.max(
                0,
                1 - progress
            );


        // ----------------------------------------------------
        // EXPANDIR
        // ----------------------------------------------------

        const scale =
            1 +
            progress *
            0.7;


        mark.scale.set(
            scale,
            scale,
            scale
        );


        // ----------------------------------------------------
        // ELIMINAR
        // ----------------------------------------------------

        if (
            elapsed >=
            impactDuration
        ) {

            scene.remove(
                mark
            );


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
// COLISIONES CONTRA LAS PAREDES
// ============================================================

function checkWallCollisions(
    sphere
) {

    const position =
        sphere.mesh.position;


    const velocity =
        sphere.velocity;


    // ========================================================
    // PARED X
    // ========================================================

    if (
        position.x >= limit ||
        position.x <= -limit
    ) {

        const side =
            position.x > 0
                ? 1
                : -1;


        position.x =
            side *
            limit;


        velocity.x *= -1;


        showCollision(
            sphere
        );


        createImpactMark(

            new THREE.Vector3(

                side *
                wallPosition,

                position.y,

                position.z

            ),

            'x'

        );

    }


    // ========================================================
    // PARED Y
    // ========================================================

    if (
        position.y >= limit ||
        position.y <= -limit
    ) {

        const side =
            position.y > 0
                ? 1
                : -1;


        position.y =
            side *
            limit;


        velocity.y *= -1;


        showCollision(
            sphere
        );


        createImpactMark(

            new THREE.Vector3(

                position.x,

                side *
                wallPosition,

                position.z

            ),

            'y'

        );

    }


    // ========================================================
    // PARED Z
    // ========================================================

    if (
        position.z >= limit ||
        position.z <= -limit
    ) {

        const side =
            position.z > 0
                ? 1
                : -1;


        position.z =
            side *
            limit;


        velocity.z *= -1;


        showCollision(
            sphere
        );


        createImpactMark(

            new THREE.Vector3(

                position.x,

                position.y,

                side *
                wallPosition

            ),

            'z'

        );

    }

}


// ============================================================
// COLISIONES ENTRE ESFERAS
// ============================================================

function checkSphereCollisions() {

    const minimumDistance =
        sphereRadius * 2;


    // Recorremos cada pareja
    // de esferas solamente una vez.
    for (
        let i = 0;
        i < spheres.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < spheres.length;
            j++
        ) {

            const sphereA =
                spheres[i];


            const sphereB =
                spheres[j];


            const positionA =
                sphereA.mesh.position;


            const positionB =
                sphereB.mesh.position;


            // Vector de A hacia B
            const difference =
                new THREE.Vector3()
                    .subVectors(
                        positionB,
                        positionA
                    );


            const distance =
                difference.length();


            // =================================================
            // DETECTAR COLISIÓN
            // =================================================

            if (
                distance <
                minimumDistance
                &&
                distance > 0
            ) {

                // Dirección de la colisión
                const normal =
                    difference
                        .clone()
                        .normalize();


                // =============================================
                // SEPARAR LAS ESFERAS
                // =============================================

                const overlap =

                    minimumDistance -

                    distance;


                positionA.addScaledVector(

                    normal,

                    -overlap / 2

                );


                positionB.addScaledVector(

                    normal,

                    overlap / 2

                );


                // =============================================
                // VELOCIDAD RELATIVA
                // =============================================

                const relativeVelocity =
                    new THREE.Vector3()
                        .subVectors(

                            sphereB.velocity,

                            sphereA.velocity

                        );


                const velocityAlongNormal =

                    relativeVelocity.dot(
                        normal
                    );


                // Si ya se están alejando
                // no aplicamos otro impulso.
                if (
                    velocityAlongNormal >= 0
                ) {

                    continue;

                }


                // =============================================
                // COLISIÓN ELÁSTICA
                // =============================================

                const restitution = 1;


                const impulseMagnitude =

                    -(1 + restitution)

                    *

                    velocityAlongNormal

                    /

                    2;


                const impulse =
                    normal
                        .clone()
                        .multiplyScalar(
                            impulseMagnitude
                        );


                sphereA.velocity
                    .addScaledVector(

                        impulse,

                        -1

                    );


                sphereB.velocity
                    .add(
                        impulse
                    );


                // =============================================
                // CAMBIO DE COLOR
                // =============================================

                showCollision(
                    sphereA
                );


                showCollision(
                    sphereB
                );

            }

        }

    }

}


// ============================================================
// CONTROLES HTML
// ============================================================

const sphereCountControl =
    document.getElementById(
        'sphereCount'
    );


const sphereCountText =
    document.getElementById(
        'sphereCountValue'
    );


const speedXControl =
    document.getElementById(
        'speedX'
    );


const speedYControl =
    document.getElementById(
        'speedY'
    );


const speedZControl =
    document.getElementById(
        'speedZ'
    );


const speedXText =
    document.getElementById(
        'speedXValue'
    );


const speedYText =
    document.getElementById(
        'speedYValue'
    );


const speedZText =
    document.getElementById(
        'speedZValue'
    );


// ============================================================
// CONTROL DE CANTIDAD DE ESFERAS
// ============================================================

sphereCountControl.addEventListener(

    'input',

    () => {

        const amount =
            parseInt(
                sphereCountControl.value
            );


        sphereCountText.textContent =
            amount;


        setSphereCount(
            amount
        );

    }

);


// ============================================================
// CAMBIAR VELOCIDAD DE UN EJE
// ============================================================

function changeAxisSpeed(
    axis,
    value
) {

    for (
        const sphere of spheres
    ) {

        const current =
            sphere.velocity[
                axis
            ];


        // Conservar la dirección
        // actual de movimiento.
        const direction =
            current < 0
                ? -1
                : 1;


        sphere.velocity[
            axis
        ] =
            value *
            direction;

    }

}


// ============================================================
// CONTROL VELOCIDAD X
// ============================================================

speedXControl.addEventListener(

    'input',

    () => {

        speedXValue =
            parseFloat(
                speedXControl.value
            );


        speedXText.textContent =
            speedXValue.toFixed(3);


        changeAxisSpeed(
            'x',
            speedXValue
        );

    }

);


// ============================================================
// CONTROL VELOCIDAD Y
// ============================================================

speedYControl.addEventListener(

    'input',

    () => {

        speedYValue =
            parseFloat(
                speedYControl.value
            );


        speedYText.textContent =
            speedYValue.toFixed(3);


        changeAxisSpeed(
            'y',
            speedYValue
        );

    }

);


// ============================================================
// CONTROL VELOCIDAD Z
// ============================================================

speedZControl.addEventListener(

    'input',

    () => {

        speedZValue =
            parseFloat(
                speedZControl.value
            );


        speedZText.textContent =
            speedZValue.toFixed(3);


        changeAxisSpeed(
            'z',
            speedZValue
        );

    }

);


// ============================================================
// CREAR ESFERAS INICIALES
// ============================================================

setSphereCount(

    parseInt(
        sphereCountControl.value
    )

);


// ============================================================
// ANIMACIÓN
// ============================================================

function animate() {


    // ========================================================
    // MOVER ESFERAS
    // ========================================================

    for (
        const sphere of spheres
    ) {

        sphere.mesh.position.add(
            sphere.velocity
        );


        checkWallCollisions(
            sphere
        );

    }


    // ========================================================
    // COLISIONES ENTRE ESFERAS
    // ========================================================

    checkSphereCollisions();


    // ========================================================
    // ACTUALIZAR COLORES
    // ========================================================

    updateCollisionColors();


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
// CAMBIO DE TAMAÑO DE VENTANA
// ============================================================

window.addEventListener(

    'resize',

    () => {

        camera.aspect =

            window.innerWidth

            /

            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

);