import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {

        // creates a field of grass with first corner (xStart, zStart) of size (xBound, zBound) with count number of blades
        function CreateGrass(count: number, xStart: number, zStart: number, xBound: number, zBound: number, scene: BABYLON.Scene) {
            let height = 0.5;
            let width = 0.0625;
            let indices = [];
            let positions = [];
            let normals: number[] = [];
            for(let i = 0; i < count; i++) {
                let x = xStart + Math.random() * xBound;
                let z = zStart + Math.random() * zBound;
                let iOffset = i * 9;

                indices.push(
                    iOffset + 0, iOffset + 1, iOffset + 2,
                    iOffset + 1, iOffset + 3, iOffset + 2,
                    iOffset + 2, iOffset + 3, iOffset + 4,
                    iOffset + 3, iOffset + 5, iOffset + 4,
                    iOffset + 4, iOffset + 5, iOffset + 6,
                    iOffset + 5, iOffset + 7, iOffset + 6,
                    iOffset + 6, iOffset + 7, iOffset + 8
                );
                positions.push(
                    x, 0, z,
                    x + width, 0, z,
                    x + width/8, height/4, z,
                    x + 7*width/8, height/4, z,
                    x + width/4, height/2, z,
                    x + 3*width/4, height/2, z,
                    x + 3*width/8, 3*height/4, z,
                    x + 5*width/8, 3*height/4, z,
                    x + width/2, height, z
                );
            }
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            let vertexData = new BABYLON.VertexData();
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = normals;

            var grass = new BABYLON.Mesh("grass", scene);
            vertexData.applyToMesh(grass);
            return grass;
        }

        // single blade method deprecated (entire functionality moved to CreateGrass)
        function CreateBlade(x: number, z: number, height: number, width: number, scene: BABYLON.Scene) {
            let indices = [
                0, 1, 2,
                1, 3, 2,
                2, 3, 4,
                3, 5, 4,
                4, 5, 6,
                5, 7, 6,
                6, 7, 8
            ];
            let positions = [
                x, 0, z,
                x + width, 0, z,
                x + width/8, height/4, z,
                x + 7*width/8, height/4, z,
                x + width/4, height/2, z,
                x + 3*width/4, height/2, z,
                x + 3*width/8, 3*height/4, z,
                x + 5*width/8, 3*height/4, z,
                x + width/2, height, z
            ];
            
            let normals: number[] = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            let vertexData = new BABYLON.VertexData();
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = normals;

            return vertexData;
        }


        //scene setup
        var scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

        // todo: add noise to the sway

        var vertex = `
        attribute vec3 position;
        attribute vec3 normal;

        uniform mat4 worldViewProjection;
        uniform float time;

        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {

            // calculating the updated positions for each triangle based off its height
            // higher y axis = more sway

            vec3 newPosition = position;

            newPosition.x += 0.1 * sin(position.z * 10.0 + time) * newPosition.y;;
            newPosition.z += 0.1 * sin(position.x * 10.0 + time) * newPosition.y;;

            // newPos = function_height * trig(pos * function_frequency + time) * wind
        
            vPosition = newPosition;
            vNormal = normal;
        
            gl_Position = worldViewProjection * vec4(newPosition, 1.0);
        }`;

    var fragment = `
    

    uniform vec3 colorTop;
    uniform vec3 colorBot;

    varying vec3 vPosition;

        void main() {

            // creating the gradient 

            // https://thebookofshaders.com/glossary/?search=mix
            vec3 color = mix(colorTop, colorBot, vPosition.y);

            gl_FragColor = vec4(color, 1.0);

        }
        `
    var myShaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertexSource: vertex,
        fragmentSource: fragment
    }, {
        attributes: ["position", "normal"],
        uniforms: ["worldViewProjection", "time", "colorTop", "colorBot"]
    });

    myShaderMaterial.setColor3("colorTop", new BABYLON.Color3(0.0, 0.2, 0.0));
    myShaderMaterial.setColor3("colorBot", new BABYLON.Color3(0.8, 1.0, 0.0));

    myShaderMaterial.backFaceCulling = false;
    
    // this generates the custom grass mesh to place on our ground mesh
    var grass = CreateGrass(10000, -3, -3, 6, 6, scene);
    grass.material = myShaderMaterial;


    // updates time for grass sway
    function update() {
        var time = performance.now()/1000;
        myShaderMaterial.setFloat("time", time);
    }
    scene.registerBeforeRender(update);

    return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
