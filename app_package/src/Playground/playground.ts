import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        function Grass(height: number, scene: BABYLON.Scene) {
            let width = 0.5;
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
                0, 0, 0,
                width, 0, 0,
                width/8, height/4, 0,
                7*width/8, height/4, 0,
                width/4, height/2, 0,
                3*width/4, height/2, 0,
                3*width/8, 3*height/4, 0,
                5*width/8, 3*height/4, 0,
                width/2, height, 0
            ];
            
            let normals: number[] = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            let blade = new BABYLON.Mesh("custom", scene);
            let vertexData = new BABYLON.VertexData();
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = normals;
            vertexData.applyToMesh(blade);

            return blade;
        }


        //scene setup
        var scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        var mat = new BABYLON.StandardMaterial("mat", scene);

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
        var blade = Grass(2, scene);
        blade.material = mat;

        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
