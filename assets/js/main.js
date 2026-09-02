import * as THREE from 'three';

import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import {
    RoomEnvironment
} from 'three/addons/environments/RoomEnvironment.js';


// ============================================================
// ESCENA
// ============================================================

const scene = new THREE.Scene();


// Fondo oscuro cálido
scene.background =
    new THREE.Color(
        0x120f16
    );


// Niebla ligera
scene.fog =
    new THREE.Fog(
        0x120f16,
        18,
        40
    );


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
    10,
    8,
    13
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


// Sombras
renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


// Tone Mapping
renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


// Exposición baja para resaltar el foco
renderer.toneMappingExposure =
    0.72;


document.body.appendChild(
    renderer.domElement
);


// ============================================================
// ENTORNO PROCEDURAL PARA EL CRISTAL
// ============================================================

const pmremGenerator =
    new THREE.PMREMGenerator(
        renderer
    );


const roomEnvironment =
    new RoomEnvironment();


const environmentTexture =
    pmremGenerator.fromScene(
        roomEnvironment,
        0.04
    ).texture;


scene.environment =
    environmentTexture;


roomEnvironment.dispose();

pmremGenerator.dispose();


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


controls.enableDamping =
    true;


controls.dampingFactor =
    0.05;


controls.minDistance =
    8;


controls.maxDistance =
    30;


controls.update();


// ============================================================
// ILUMINACIÓN GENERAL
// ============================================================

// Luz ambiental muy tenue
const ambientLight =
    new THREE.AmbientLight(
        0xffe9f1,
        0.08
    );


scene.add(
    ambientLight
);


// ============================================================
// LUZ SECUNDARIA
// ============================================================

const secondaryLight =
    new THREE.DirectionalLight(
        0xd9c9ff,
        0.18
    );


secondaryLight.position.set(
    -8,
    12,
    6
);


scene.add(
    secondaryLight
);


// ============================================================
// CONFIGURACIÓN GENERAL
// ============================================================

const boxSize =
    10;


const sphereRadius =
    0.5;


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

        color:
            0xdcefff,

        transmission:
            1,

        transparent:
            true,

        opacity:
            0.18,

        roughness:
            0.04,

        metalness:
            0,

        ior:
            1.5,

        thickness:
            0.45,

        attenuationColor:
            new THREE.Color(
                0xaedcff
            ),

        attenuationDistance:
            5,

        clearcoat:
            0.35,

        clearcoatRoughness:
            0.05,

        side:
            THREE.DoubleSide,

        depthWrite:
            false

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
// ALFOMBRA
// ============================================================

const carpetSize =
    18;


const carpetGeometry =
    new THREE.PlaneGeometry(
        carpetSize,
        carpetSize,
        100,
        100
    );


const carpetPositions =
    carpetGeometry.attributes.position;


// ============================================================
// RELIEVE PROCEDURAL DE LA ALFOMBRA
// ============================================================

for (
    let i = 0;
    i < carpetPositions.count;
    i++
) {

    const x =
        carpetPositions.getX(i);


    const y =
        carpetPositions.getY(i);


    const wave1 =
        Math.sin(
            x * 5
        ) * 0.018;


    const wave2 =
        Math.cos(
            y * 6
        ) * 0.015;


    const wave3 =
        Math.sin(
            (x + y) * 9
        ) * 0.009;


    const detail =
        Math.sin(
            x * 13 +
            y * 11
        ) * 0.005;


    carpetPositions.setZ(

        i,

        wave1 +
        wave2 +
        wave3 +
        detail

    );

}


carpetPositions.needsUpdate =
    true;


carpetGeometry.computeVertexNormals();


// ============================================================
// MATERIAL DE LA ALFOMBRA
// ============================================================

const carpetMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0xc26789,

        roughness:
            1,

        metalness:
            0

    });


const carpet =
    new THREE.Mesh(
        carpetGeometry,
        carpetMaterial
    );


carpet.rotation.x =
    -Math.PI / 2;


carpet.position.y =
    -boxSize / 2 -
    0.1;


carpet.receiveShadow =
    true;


scene.add(
    carpet
);


// ============================================================
// FOCO DIRECCIONAL
// ============================================================

const spotLight =
    new THREE.SpotLight(

        0xff5fa2,

        350,

        30,

        THREE.MathUtils.degToRad(
            28
        ),

        0.35,

        1.5

    );


spotLight.position.set(
    0,
    boxSize / 2 + 3,
    0
);


spotLight.castShadow =
    true;


spotLight.shadow.mapSize.width =
    2048;


spotLight.shadow.mapSize.height =
    2048;


spotLight.shadow.camera.near =
    0.5;


spotLight.shadow.camera.far =
    40;


// ============================================================
// OBJETIVO DEL FOCO
// ============================================================

// Aunque ya no mostramos líneas,
// el SpotLight necesita un objetivo
// para saber hacia dónde iluminar.

const lightTarget =
    new THREE.Object3D();


lightTarget.position.set(
    0,
    0,
    0
);


scene.add(
    lightTarget
);


spotLight.target =
    lightTarget;


scene.add(
    spotLight
);


// ============================================================
// REPRESENTACIÓN VISUAL DEL FOCO
// ============================================================

const lampGroup =
    new THREE.Group();


// ============================================================
// CUERPO DEL FOCO
// ============================================================

const lampBody =
    new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.3,
            0.22,
            0.45,
            32
        ),

        new THREE.MeshStandardMaterial({

            color:
                0x2c2530,

            roughness:
                0.35,

            metalness:
                0.65

        })

    );


lampBody.rotation.x =
    Math.PI / 2;


lampGroup.add(
    lampBody
);


// ============================================================
// BOMBILLA
// ============================================================

const bulb =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            0.18,
            32,
            32
        ),

        new THREE.MeshStandardMaterial({

            color:
                0xffffff,

            emissive:
                0xff4f9a,

            emissiveIntensity:
                8,

            roughness:
                0.1

        })

    );


bulb.position.y =
    -0.25;


lampGroup.add(
    bulb
);


// ============================================================
// HALO DEL FOCO
// ============================================================

const halo =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            0.36,
            32,
            32
        ),

        new THREE.MeshBasicMaterial({

            color:
                0xff75ad,

            transparent:
                true,

            opacity:
                0.18,

            depthWrite:
                false

        })

    );


halo.position.copy(
    bulb.position
);


lampGroup.add(
    halo
);


lampGroup.position.copy(
    spotLight.position
);


scene.add(
    lampGroup
);


// ============================================================
// CONTROL DEL FOCO CON EL MOUSE
// ============================================================

const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();


let draggingLight =
    false;


// ============================================================
// ALTURA DEL FOCO
// ============================================================

const lightHeight =
    boxSize / 2 + 3;


// ============================================================
// PLANO INVISIBLE DE MOVIMIENTO
// ============================================================

// El foco solamente se puede mover
// horizontalmente sobre la caja.

const movementPlane =
    new THREE.Plane(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        -lightHeight

    );


const intersectionPoint =
    new THREE.Vector3();


// ============================================================
// ACTUALIZAR POSICIÓN DEL MOUSE
// ============================================================

function updateMouse(
    event
) {

    mouse.x =
        (
            event.clientX /
            window.innerWidth
        ) * 2 - 1;


    mouse.y =
        -(
            event.clientY /
            window.innerHeight
        ) * 2 + 1;

}


// ============================================================
// INICIAR ARRASTRE DEL FOCO
// ============================================================

renderer.domElement.addEventListener(
    'pointerdown',
    (event) => {

        updateMouse(
            event
        );


        raycaster.setFromCamera(
            mouse,
            camera
        );


        // Comprobar si hicimos clic
        // sobre el foco.
        const intersections =
            raycaster.intersectObject(
                lampGroup,
                true
            );


        if (
            intersections.length > 0
        ) {

            draggingLight =
                true;


            // Desactivar OrbitControls
            // mientras movemos el foco.
            controls.enabled =
                false;


            renderer.domElement.style.cursor =
                'grabbing';

        }

    }
);


// ============================================================
// MOVER FOCO
// ============================================================

renderer.domElement.addEventListener(
    'pointermove',
    (event) => {

        updateMouse(
            event
        );


        // ====================================================
        // DETECTAR SI EL CURSOR ESTÁ SOBRE EL FOCO
        // ====================================================

        if (
            !draggingLight
        ) {

            raycaster.setFromCamera(
                mouse,
                camera
            );


            const intersections =
                raycaster.intersectObject(
                    lampGroup,
                    true
                );


            if (
                intersections.length > 0
            ) {

                renderer.domElement.style.cursor =
                    'grab';

            }

            else {

                renderer.domElement.style.cursor =
                    'default';

            }

        }


        // Si no estamos arrastrando,
        // no modificamos la posición.
        if (
            !draggingLight
        ) {

            return;

        }


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const hit =
            raycaster.ray.intersectPlane(
                movementPlane,
                intersectionPoint
            );


        if (
            !hit
        ) {

            return;

        }


        // ====================================================
        // LIMITAR MOVIMIENTO
        // ====================================================

        const maxMovement =
            boxSize / 2;


        const newX =
            THREE.MathUtils.clamp(

                intersectionPoint.x,

                -maxMovement,

                maxMovement

            );


        const newZ =
            THREE.MathUtils.clamp(

                intersectionPoint.z,

                -maxMovement,

                maxMovement

            );


        // ====================================================
        // MOVER EL SPOTLIGHT
        // ====================================================

        spotLight.position.set(
            newX,
            lightHeight,
            newZ
        );


        // Mover también la representación
        // visual del foco.
        lampGroup.position.copy(
            spotLight.position
        );

    }
);


// ============================================================
// SOLTAR FOCO
// ============================================================

window.addEventListener(
    'pointerup',
    () => {

        if (
            draggingLight
        ) {

            draggingLight =
                false;


            // Reactivar controles
            // de la cámara.
            controls.enabled =
                true;


            renderer.domElement.style.cursor =
                'grab';

        }

    }
);


// ============================================================
// COLORES DE LAS ESFERAS
// ============================================================

const sphereGlassColor =
    new THREE.Color(
        0xf8d9e8
    );


const collisionColor =
    new THREE.Color(
        0xff336c
    );


const collisionColorDuration =
    220;


// ============================================================
// ESFERAS
// ============================================================

const spheres =
    [];


const sphereGeometry =
    new THREE.SphereGeometry(
        sphereRadius,
        48,
        48
    );


// ============================================================
// VELOCIDADES
// ============================================================

let speedXValue =
    0.035;


let speedYValue =
    0.027;


let speedZValue =
    0.041;


// ============================================================
// SIGNO ALEATORIO
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


    let attempts =
        0;


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
// CREAR ESFERA DE CRISTAL
// ============================================================

function createSphere() {

    const material =
        new THREE.MeshPhysicalMaterial({

            color:
                sphereGlassColor.clone(),

            transmission:
                0.95,

            transparent:
                true,

            opacity:
                0.62,

            roughness:
                0.04,

            metalness:
                0,

            ior:
                1.45,

            thickness:
                1,

            clearcoat:
                0.45,

            clearcoatRoughness:
                0.05,

            attenuationColor:
                new THREE.Color(
                    0xffbcd5
                ),

            attenuationDistance:
                2

        });


    const mesh =
        new THREE.Mesh(
            sphereGeometry,
            material
        );


    mesh.position.copy(
        createRandomPosition()
    );


    mesh.castShadow =
        true;


    mesh.receiveShadow =
        true;


    scene.add(
        mesh
    );


    spheres.push({

        mesh:
            mesh,

        velocity:
            new THREE.Vector3(

                speedXValue *
                randomSign(),

                speedYValue *
                randomSign(),

                speedZValue *
                randomSign()

            ),

        collisionUntil:
            0

    });

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
// CANTIDAD DE ESFERAS
// ============================================================

function setSphereCount(
    amount
) {

    while (
        spheres.length <
        amount
    ) {

        createSphere();

    }


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


    sphere.mesh.material.emissive =
        new THREE.Color(
            0xff174f
        );


    sphere.mesh.material.emissiveIntensity =
        1.8;

}


// ============================================================
// RESTAURAR COLOR
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
                sphereGlassColor
            );


            sphere.mesh.material.emissive =
                new THREE.Color(
                    0x000000
                );


            sphere.mesh.material.emissiveIntensity =
                0;

        }

    }

}


// ============================================================
// MARCAS DE IMPACTO
// ============================================================

const impactMarks =
    [];


const impactDuration =
    650;


// ============================================================
// CREAR MARCA DE IMPACTO
// ============================================================

function createImpactMark(
    position,
    axis
) {

    const geometry =
        new THREE.RingGeometry(
            0.08,
            0.3,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({

            color:
                0xff5b99,

            transparent:
                true,

            opacity:
                0.9,

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
                0.9 *
                (1 - progress)
            );


        const scale =
            1 +
            progress *
            1.2;


        mark.scale.setScalar(
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
// COLISIONES CONTRA PAREDES
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
            side *
            limit;


        velocity.x *=
            -1;


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
            side *
            limit;


        velocity.y *=
            -1;


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
            side *
            limit;


        velocity.z *=
            -1;


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


            const difference =
                new THREE.Vector3()
                    .subVectors(

                        sphereB.mesh.position,

                        sphereA.mesh.position

                    );


            const distance =
                difference.length();


            if (
                distance <
                minimumDistance
                &&
                distance > 0
            ) {

                const normal =
                    difference
                        .clone()
                        .normalize();


                // Separación para evitar
                // que las esferas se atraviesen.
                const overlap =
                    minimumDistance -
                    distance;


                sphereA.mesh.position
                    .addScaledVector(

                        normal,

                        -overlap / 2

                    );


                sphereB.mesh.position
                    .addScaledVector(

                        normal,

                        overlap / 2

                    );


                // Velocidad relativa
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


                // Si ya se están separando,
                // no aplicar otro impulso.
                if (
                    velocityAlongNormal >= 0
                ) {

                    continue;

                }


                // =================================================
                // COLISIÓN ELÁSTICA
                // =================================================

                const restitution =
                    1;


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


                // Cambio visual
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
// CONTROL DE CANTIDAD
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
// CAMBIAR VELOCIDAD
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
            speedXValue.toFixed(
                3
            );


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
            speedYValue.toFixed(
                3
            );


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
            speedZValue.toFixed(
                3
            );


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
    // EFECTOS
    // ========================================================

    updateCollisionColors();


    updateImpactMarks();


    // ========================================================
    // ANIMACIÓN DEL HALO
    // ========================================================

    const time =
        performance.now() *
        0.003;


    const haloScale =
        1 +
        Math.sin(
            time
        ) * 0.1;


    halo.scale.setScalar(
        haloScale
    );


    // ========================================================
    // CONTROLES DE CÁMARA
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