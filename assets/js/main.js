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

        window.innerWidth /
        window.innerHeight,

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
// ILUMINACIÓN
// ============================================================

scene.add(

    new THREE.AmbientLight(
        0xffffff,
        1.4
    )

);


const light =
    new THREE.DirectionalLight(
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
// CONFIGURACIÓN DE LA CAJA
// ============================================================

const boxSize = 10;

const sphereRadius = 0.5;

const wallPosition =
    boxSize / 2;

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

        side: THREE.DoubleSide,

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
// BORDES
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
// COLORES
// ============================================================

const normalColor =
    new THREE.Color(
        0xff7043
    );


const collisionColor =
    new THREE.Color(
        0xffff00
    );


// Tiempo que permanecerá
// el cambio de color.

const collisionColorDuration =
    180;


// ============================================================
// ESFERAS
// ============================================================

const spheres = [];


// Geometría compartida por todas
// las esferas.

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
// GENERAR DIRECCIÓN ALEATORIA
// ============================================================

function randomSign() {

    return Math.random() < 0.5
        ? -1
        : 1;

}


// ============================================================
// COMPROBAR POSICIÓN DISPONIBLE
// ============================================================

function positionIsAvailable(
    position
) {

    for (const sphere of spheres) {

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
// GENERAR POSICIÓN ALEATORIA
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

        !positionIsAvailable(position) &&

        attempts < 100

    );


    return position;

}


// ============================================================
// CREAR ESFERA
// ============================================================

function createSphere() {

    const material =
        new THREE.MeshStandardMaterial({

            color:
                normalColor.clone(),

            roughness:
                0.35

        });


    const mesh =
        new THREE.Mesh(

            sphereGeometry,

            material

        );


    mesh.position.copy(
        createRandomPosition()
    );


    scene.add(
        mesh
    );


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

    while (
        spheres.length < amount
    ) {

        createSphere();

    }


    while (
        spheres.length > amount
    ) {

        removeSphere();

    }

}


// ============================================================
// MOSTRAR COLISIÓN MEDIANTE COLOR
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
// CREAR MARCA
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

            color: 0xffd54f,

            transparent: true,

            opacity: 1,

            side:
                THREE.DoubleSide,

            depthWrite: false

        });


    const mark =
        new THREE.Mesh(
            geometry,
            material
        );


    mark.position.copy(
        position
    );


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


        mark.material.opacity =
            Math.max(
                0,
                1 - progress
            );


        const scale =
            1 +
            progress * 0.7;


        mark.scale.set(
            scale,
            scale,
            scale
        );


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
// COLISIONES CON PAREDES
// ============================================================

function checkWallCollisions(
    sphere
) {

    const position =
        sphere.mesh.position;


    const velocity =
        sphere.velocity;


    // ========================================================
    // X
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
            side * limit;


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
    // Y
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
            side * limit;


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
    // Z
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
            side * limit;


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


    // Comparar cada esfera
    // con todas las posteriores.

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


            // Vector que va de
            // A hacia B.

            const difference =
                new THREE.Vector3()
                    .subVectors(
                        positionB,
                        positionA
                    );


            const distance =
                difference.length();


            // =================================================
            // EXISTE COLISIÓN
            // =================================================

            if (
                distance <
                minimumDistance &&
                distance > 0
            ) {

                const normal =
                    difference
                        .clone()
                        .normalize();


                // =============================================
                // SEPARAR ESFERAS
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


                // Si ya se están alejando,
                // no volvemos a aplicar impulso.

                if (
                    velocityAlongNormal >= 0
                ) {

                    continue;

                }


                // =============================================
                // COLISIÓN ELÁSTICA
                // =============================================

                // Las dos esferas tienen
                // la misma masa.

                const restitution = 1;


                const impulseMagnitude =

                    -(1 + restitution) *

                    velocityAlongNormal /

                    2;


                const impulse =
                    normal
                        .clone()
                        .multiplyScalar(
                            impulseMagnitude
                        );


                sphereA.velocity.addScaledVector(
                    impulse,
                    -1
                );


                sphereB.velocity.add(
                    impulse
                );


                // =============================================
                // COLOR DE COLISIÓN
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
// CONTROL CANTIDAD
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
// MODIFICAR VELOCIDAD POR EJE
// ============================================================

function changeAxisSpeed(
    axis,
    value
) {

    for (
        const sphere of spheres
    ) {

        const current =
            sphere.velocity[axis];


        // Mantener la dirección
        // actual de cada esfera.

        const direction =
            current < 0
                ? -1
                : 1;


        sphere.velocity[axis] =
            value *
            direction;

    }

}


// ============================================================
// VELOCIDAD X
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
// VELOCIDAD Y
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
// VELOCIDAD Z
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
    // COLORES
    // ========================================================

    updateCollisionColors();


    // ========================================================
    // MARCAS
    // ========================================================

    updateImpactMarks();


    // ========================================================
    // CÁMARA
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
// INICIAR
// ============================================================

renderer.setAnimationLoop(
    animate
);


// ============================================================
// RESPONSIVE
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