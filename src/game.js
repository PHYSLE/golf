import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/core/Physics/physicsEngineComponent"
import "@babylonjs/loaders/glTF";
//import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
//registerBuiltInLoaders();

function Game() {
  const game = {
      globals: {
          /*
          damping: .34,
          impulseModifier: 10,
          maxImpulse: 120,
          aimLineModifier: 1.2
          */
          restitution: .55,       // determine how bouncy the ball is
          damping: .64,           // reduce velocity of the ball
          friction: .75,          // the friction of the ball
          gravity: -9.8,          // gravity of scene
          impulseModifier: 5,     // velocity modifier of impulse per ms of swing
          maxImpulse: 230,        // max velocity of impulse
          tileSize: 60,           // size of grid tile
          bumperHeight: 15,       // height of bumpers
          aimLineSegments: 16,    // number of line segments in aim line
          aimLineModifier: 1.3,   // divisor of line per swing impulse
          exitVelocity: 120       // default velocity of ball leaving tunnel
      },
      paused: false,
      engine: null,
      scene: null,
      camera: null,
      ball: {
          diameter: 4,
          mesh: null,
          body: null,
          events: new EventTarget(),
          stopped: true,
          stop:function() {
              this.stopped = true;
              this.body.setAngularVelocity(BABYLON.Vector3.Zero());
              this.body.setLinearVelocity(BABYLON.Vector3.Zero());
              this.events.dispatchEvent(new Event('stop'));
          },
          moved:function() {
              this.stopped = false;
              this.events.dispatchEvent(new Event('move'));
          },
          get velocity() {
              let v = this.body.getLinearVelocity();
              return (Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z));
          }
      },
      disposables:[],
      strikePosition: new BABYLON.Vector3(),
      impulseTime: 0,
      getImpulseAmount: function() {
          let amount= (new Date() - this.impulseTime) / this.globals.impulseModifier;
          if (amount > this.globals.maxImpulse) {
              amount = this.globals.maxImpulse;
          }
          return amount;
      },
      materials: {
          green: null,
          bumper: null
      },
      meshes: {
        deformed: null,
        bumperRoot: null, // move to meshes
        bumperHalf: null, // "
      },
      shadows:[],
      aimLine: [],
      renderAimLine: false,
      init: async function() {

          const canvas = document.getElementById("canvas");

          this.engine = new BABYLON.Engine(canvas, true, {
              preserveDrawingBuffer: true,
              stencil: true,
              disableWebGL2Support: false });
          this.scene = new BABYLON.Scene(this.engine);

          //const light1 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
          const light1 = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -5, 5), this.scene);
          const light2 = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(5, -4, 5), this.scene);
          light1.intensity = 0.7; // dim light
          light2.intensity = 0.7; // dim light

          //this.shadows.push(new BABYLON.ShadowGenerator(1024, light1));
          this.shadows.push(new BABYLON.ShadowGenerator(1024, light2));

          // create a camera
          this.camera = new BABYLON.ArcRotateCamera("camera", Math.PI/4, Math.PI/4, 10, new BABYLON.Vector3(0,0,0));
          this.camera.setPosition(new BABYLON.Vector3(0, 200, -160));
          this.camera.attachControl(canvas, true);


          // enable Havok
          const havok = await HavokPhysics();
          this.scene.enablePhysics(new BABYLON.Vector3(0, this.globals.gravity, 0), new BABYLON.HavokPlugin(true, havok));

          // create materials
          this.materials.sky = new BABYLON.StandardMaterial("skymat", this.scene);
          this.materials.sky.backFaceCulling = false;
          this.materials.sky.disableLighting = true;
          this.materials.sky.reflectionTexture = new BABYLON.CubeTexture("/assets/sky/skybox1", this.scene);
          this.materials.sky.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

          const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
          skybox.material = this.materials.sky;
          skybox.infiniteDistance = true;

          this.materials.green = new BABYLON.PBRMaterial('greenmat',this.scene);
          this.materials.green.albedoTexture = new BABYLON.Texture('/assets/green.jpg',this.scene);
          this.materials.green.albedoTexture.uScale = 1;
          this.materials.green.albedoTexture.vScale = 1;
          this.materials.green.metallic = 0;
          this.materials.green.roughness = .6;
          //this.materials.green.diffuseColor = new BABYLON.Color3(.6, .8, .6);

          this.materials.bumper = new BABYLON.StandardMaterial("bumpermat");
          this.materials.bumper.diffuseColor = new BABYLON.Color3(.15, .38, .1);

          this.materials.shadow = new BABYLON.StandardMaterial("bumpermat");
          this.materials.shadow.diffuseColor = new BABYLON.Color3(0, .1, 0);

          // root meshes for bumper instances
          this.meshes.bumperRoot = BABYLON.MeshBuilder.CreateBox("bumper", {
              height: this.globals.bumperHeight, width:this.globals.tileSize+1, depth: 1}, this.scene);
          this.meshes.bumperRoot.material = this.materials.bumper;
          this.meshes.bumperRoot.isVisible = false;

          this.meshes.bumperHalf = BABYLON.MeshBuilder.CreateBox("bumper", {
              height: this.globals.bumperHeight, width:this.globals.tileSize/2, depth: 1}, this.scene);
          this.meshes.bumperHalf.material = this.materials.bumper;
          this.meshes.bumperHalf.isVisible = false;

          for(let i=1; i<5; i++) {
              let file = "/assets/ground-tile-deform"+i+".glb";
              let result = await BABYLON.LoadAssetContainerAsync(file, this.scene);
              let rootMesh = result.createRootMesh();
              let children = rootMesh.getChildMeshes();
              this.meshes["deformed"+i] = children[1]; // what is the first mesh??
              this.meshes["deformed"+i].scaling = new BABYLON.Vector3(10, 10, 10)
              this.meshes["deformed"+i].material = this.materials.green;
          }

          // something more fancy
          //const result = await Promise.all(files.map(async (file) => BABYLON.LoadAssetContainerAsync(file, this.scene)));
      },
      disposeAimLine: function() {
          //console.log('disposing ' + this.aimLine.length + ' segments')
          if (this.aimLine.length > 0) {
              for(let i=0; i<this.aimLine.length; i++) {
                  this.aimLine[i].dispose();
              }
              this.aimLine = [];
          }
      },
      refreshAimLine: function() {
          let segs = this.globals.aimLineSegments;
          let lineLen = this.getImpulseAmount() / this.globals.aimLineModifier;
          let a = lineLen/segs; //(lineLen * (1 + this.globals.damping)) / segs;
          let angle = this.camera.alpha + Math.PI;
          let segLen = new BABYLON.Vector3(a * Math.cos(angle), 0, a * Math.sin(angle));
          let offset = BABYLON.Vector3.Zero();
          let distance = this.ball.diameter + 1; // start aim line this far from ball
          let padding = new BABYLON.Vector3(distance * Math.cos(angle), 0, distance * Math.sin(angle));

          for(let i=0; i<segs; i++) {
              offset = segLen.multiply(new BABYLON.Vector3(i, 0, i));
              let start = this.ball.mesh.position.add(offset).add(padding);
              let end = start.add(segLen);

              const options = {
                  useVertexAlpha: true, // for transparency
                  points: [start, end]
              };
              let line = BABYLON.MeshBuilder.CreateLines("line", options, this.scene);
              line.forceRenderingWhenOccluded = true;
              line.alpha = 1-(i/segs);
              this.aimLine.push(line);
          }
          // dispose after create to avoid blinking
          if (this.aimLine.length > segs * 2) {
              for(let i=0; i<segs; i++) {
                  this.aimLine[0].dispose();
                  this.aimLine.shift();
              }
          }
      },

      swing: function() {
          if (this.ball.stopped) {
              this.impulseTime = new Date();
              this.renderAimLine = true;
              // this.predictPath(); WiP prediction.js
          }
      },
      strike: function() {
          if (this.ball.stopped && this.impulseTime != 0) {
              this.renderAimLine = false;
              this.disposeAimLine();
              this.strikePosition.copyFrom(this.ball.mesh.position);
              clearInterval(this.aimLineInterval);

              let a = this.getImpulseAmount()
              let angle = this.camera.alpha + Math.PI;
              let impulse = new BABYLON.Vector3(a * Math.cos(angle), 0, a * Math.sin(angle));
              this.ball.body.applyImpulse(impulse, this.ball.mesh.position);
          }
      },
      clear: function() {
        for(var i=0; i<this.disposables.length;i++) {
            this.disposables[i].dispose();
        }
        this.disposables = [];
        this.impulseTime = 0;
      },
      run: function() {
          var _self = this;
          this.scene.actionManager = new BABYLON.ActionManager(this.scene);

          this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
              trigger: BABYLON.ActionManager.OnEveryFrameTrigger },
              () => { // set a min threshold for velocity
                  if (!_self.ball.stopped && _self.ball.velocity < 1) {
                      _self.ball.stop();
                  }
                  else if (_self.ball.stopped && _self.ball.velocity >= 1) {
                      _self.ball.moved();
                  }
                  if (_self.ball.mesh.position.y < -20) {
                      // out of bounds
                      _self.ball.mesh.setAbsolutePosition(this.strikePosition);
                      _self.ball.stop()
                  }
              }
          ));

          this.engine.runRenderLoop(function () {
              var step = 0;
              if (_self.scene && !_self.paused) {
                  _self.scene.render();
                  if (_self.renderAimLine) {
                      if (step % 200 == 0) {
                          _self.refreshAimLine();
                      }
                  }
                  step++;
              }
          });
      },
      addEventListener:function(type, callback, options = {}) {
          this.ball.events.addEventListener(type, callback, options);
      },
      addBall: function(x, y, z) {
          const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
              diameter: this.ball.diameter,
              segments: 16 }, this.scene);
          ball.position = new BABYLON.Vector3(x, y, z);
          this.camera.lockedTarget = ball;
          this.ball.mesh = ball;

          const aggregate = new BABYLON.PhysicsAggregate(ball, BABYLON.PhysicsShapeType.SPHERE, {
              mass: 2,
              restitution: this.globals.restitution,
              friction: this.globals.friction }, this.scene);
          aggregate.body.setLinearDamping(game.globals.damping);
          aggregate.body.disablePreStep = false; // disablePreStep allows moving the ball manually
          this.ball.body = aggregate.body;
          for(let i=0; i<this.shadows.length; i++) {
              this.shadows[i].getShadowMap().renderList.push(ball);
          }
          this.disposables.push(ball);
          return ball;
      },
      addBumper: function(x, y, z, options) {
          const bumper = options && options.half ?
              this.meshes.bumperHalf.createInstance("bumper") :
              this.meshes.bumperRoot.createInstance("bumper");
          bumper.position = new BABYLON.Vector3(x, y, z);
          if (options && options.rotation) {
              bumper.rotation = new BABYLON.Vector3(options.rotation.x, options.rotation.y, options.rotation.z );
          }
          const aggregate = new BABYLON.PhysicsAggregate(bumper, BABYLON.PhysicsShapeType.BOX, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);
          for(let i=0; i<this.shadows.length; i++) {
              this.shadows[i].getShadowMap().renderList.push(bumper);
          }
          this.disposables.push(bumper);
          return bumper;
      },
      addGround: function(x, y, z, options={}) {
          var size = { width: this.globals.tileSize, height: this.globals.tileSize }
          var internal = ["full","narrow","short","quarter"]

          if (!options.mesh) {
              options.mesh = "full";
          }
          if (options.mesh == "narrow" || options.mesh == "quarter") {
              size.width = this.globals.tileSize/2;
          }
          if (options.mesh == "short" || options.mesh == "quarter") {
              size.height = this.globals.tileSize/2;
          }

          let ground = null;
          let shape = BABYLON.PhysicsShapeType.BOX;
          if (internal.includes(options.mesh)) {
              ground = BABYLON.MeshBuilder.CreateGround("ground", size, this.scene);
              ground.position = new BABYLON.Vector3(x, y, z);
              if (options && options.rotation) {
                  ground.rotation = new BABYLON.Vector3(options.rotation.x, 0, options.rotation.z);
              }
          }
          else {
              ground = this.meshes[options.mesh].clone("ground");
              ground.position = new BABYLON.Vector3(-x, y, z);
              shape = BABYLON.PhysicsShapeType.MESH;
          }

          ground.material = this.materials.green;
          ground.receiveShadows = true;
          const aggregate = new BABYLON.PhysicsAggregate(ground, shape, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);

          if (options && options.bumpers) {
            /* top | right | bottom | left */
            for(let i=0; i<4; i++) {
                var r = BABYLON.Vector3.Zero();
                if (options.rotation ) {
                    r = new BABYLON.Vector3(options.rotation.x, 0, options.rotation.z);
                }
                if (options.bumpers[i]=="1") {
                    switch(i) {
                        case 0:
                          if (options.mesh == "narrow" || options.mesh == "quarter") {
                              this.addBumper(x, y, z + size.height/2, {rotation:r, half: true});
                          }
                          else {
                              this.addBumper(x, y, z + size.height/2, {rotation:r});
                          }
                          break;
                        case 1:
                          r = new BABYLON.Vector3(r.z, r.y, r.x).add(new  BABYLON.Vector3(0, Math.PI/2, 0));

                          if (options.mesh == "short" || options.mesh == "quarter") {
                              this.addBumper(x + size.width/2, y, z, {rotation:r, half: true});
                          }
                          else {
                              this.addBumper(x + size.width/2, y, z, {rotation:r});
                          }
                          break;
                        case 2:
                          if (options.mesh == "narrow" || options.mesh == "quarter") {
                              this.addBumper(x, y, z - size.height/2, {rotation:r, half: true});
                          }
                          else {
                              this.addBumper(x, y, z - size.height/2, {rotation:r});
                          }
                          break;
                        case 3:
                          r = new BABYLON.Vector3(r.z, r.y, r.x).add(new  BABYLON.Vector3(0, Math.PI/2, 0));
                          if (options.mesh == "short" || options.mesh == "quarter") {
                              this.addBumper(x - size.width/2, y, z, {rotation:r, half: true});
                          }
                          else {
                              this.addBumper(x - size.width/2, y, z, {rotation:r});
                          }
                          break;
                        }
                    }
                }
            }
            this.disposables.push(ground);
            return ground;
      },
      addCorner: function(x, y, z, options) {
          const ground = BABYLON.MeshBuilder.CreateGround("ground", {
              width: this.globals.tileSize,
              height: this.globals.tileSize }, this.scene);
          ground.position = new BABYLON.Vector3(x, y, z);
          ground.material = this.materials.green;
          ground.receiveShadows = true;

          new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);

          const box = BABYLON.MeshBuilder.CreateBox("box", {
              width: this.globals.tileSize+1,
              height: this.globals.bumperHeight,
              depth: this.globals.tileSize+1 }, this.scene);
          box.position = new BABYLON.Vector3(x, y, z);
          box.material = this.materials.ground;

          const cylinder = BABYLON.MeshBuilder.CreateCylinder("tube", {
              height:20,
              diameterTop:this.globals.tileSize * 2-1,
              diameterBottom:this.globals.tileSize * 2-1,
              tessellation:64,
              subdivisions:1
          }, this.scene);

          cylinder.position = new BABYLON.Vector3(x+this.globals.tileSize/2, y, z-this.globals.tileSize/2);
          var boxCSG = BABYLON.CSG.FromMesh(box);
          var cylinderCSG = BABYLON.CSG.FromMesh(cylinder);

          var corner = boxCSG.subtract(cylinderCSG).toMesh("corner", null, this.scene);
          corner.position = new BABYLON.Vector3(x, y, z);
          var rotation = options ? options.rotation: 0;
          corner.rotation = new BABYLON.Vector3(0, rotation, 0);
          corner.material = this.materials.bumper;

          for(let i=0; i<this.shadows.length; i++) {
              this.shadows[i].getShadowMap().renderList.push(corner);
          }
          new BABYLON.PhysicsAggregate(corner, BABYLON.PhysicsShapeType.MESH, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);

          // delete the cylinder and box
          cylinder.dispose();
          box.dispose();
          this.disposables.push(ground);
          this.disposables.push(corner);

          return ground;
      },
      addBarrier: function(x, y, z, options) {
          var mesh = null;
          var physicsShape = null;
          if (!options) {
              options = {shape: "circle", size: 30}
          }
          switch(options.shape) {
              case "circle":
                mesh = BABYLON.MeshBuilder.CreateCylinder("barrier", {
                    height:this.globals.bumperHeight/2,
                    diameterTop:options.size,
                    diameterBottom:options.size,
                    tessellation:options.size < 20 ? 24 : 32,
                    subdivisions:1
                }, this.scene);
                mesh.position = new BABYLON.Vector3(x, y + this.globals.bumperHeight/4, z);

                physicsShape = BABYLON.PhysicsShapeType.CYLINDER;
              break;
              case "box":
                mesh = BABYLON.MeshBuilder.CreateBox("barrier", {
                    height:this.globals.bumperHeight/2,
                    width: options.size,
                    depth: options.size
                }, this.scene);
                mesh.position = new BABYLON.Vector3(x, y + this.globals.bumperHeight/4, z);

                physicsShape = BABYLON.PhysicsShapeType.BOX;
              break;
              case "bump":
                const box = BABYLON.MeshBuilder.CreateBox("box", {
                    height: this.globals.tileSize*2,
                    width: this.globals.tileSize*2,
                    depth: this.globals.tileSize*2
                }, this.scene);
                var y1 = +800;
                box.position = new BABYLON.Vector3(x, y-this.globals.tileSize, z);
                const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
                    diameter: options.size*2,
                    segments: 32 }, this.scene);

                ball.position = new BABYLON.Vector3(x, y - options.size*.85, z);
                var boxCSG = BABYLON.CSG.FromMesh(box);
                var ballCSG = BABYLON.CSG.FromMesh(ball);

                ball.dispose();
                box.dispose();

                var mesh = ballCSG.subtract(boxCSG).toMesh("barrier", null, this.scene);

                mesh.position = new BABYLON.Vector3(x, y - options.size*.85, z);

                physicsShape = BABYLON.PhysicsShapeType.MESH;
              break;
              case "bridge":
                var w = this.globals.tileSize/2;
                var slope1 = BABYLON.MeshBuilder.CreateBox("slope1", {
                    height:this.globals.bumperHeight/2, width: w, depth: 24
                }, this.scene);
                slope1.position = new BABYLON.Vector3(x, y-2, z-options.size/2-8.9);
                slope1.rotation = new BABYLON.Vector3(-.477, 0, 0);

                var slope2 = BABYLON.MeshBuilder.CreateBox("slope2", {
                    height:this.globals.bumperHeight/2, width: w, depth: 24
                }, this.scene);
                slope2.position = new BABYLON.Vector3(x, y-2, z+options.size/2+8.9);
                slope2.rotation = new BABYLON.Vector3(.477, 0, 0);

                var top = BABYLON.MeshBuilder.CreateBox("box", {
                    height:this.globals.bumperHeight/2, width: w, depth: options.size
                }, this.scene);
                top.position = new BABYLON.Vector3(x, y+3.1, z);

                var slope1CSG = BABYLON.CSG.FromMesh(slope1);
                var slope2CSG = BABYLON.CSG.FromMesh(slope2);
                var topCSG = BABYLON.CSG.FromMesh(top);

                slope1.dispose();
                slope2.dispose();
                top.dispose();

                var mesh = topCSG.union(slope1CSG)
                mesh = mesh.union(slope2CSG).toMesh("barrier", null, this.scene);

                mesh.position = new BABYLON.Vector3(x, y+7, z);

                physicsShape = BABYLON.PhysicsShapeType.MESH;
                /*
                  golf.addBarrier(30,-2,155,{shape:"box",size:24,rotation:{x:-.477}});
                  golf.addBarrier(30,3.2,176,{shape:"box",size:24});
                  // z: 183
                  golf.addBarrier(30,3.2,190,{shape:"box",size:24});
                  golf.addBarrier(30,-2,211,{shape:"box",size:24,rotation:{x:.477}});
                  */
              break;
          }

          mesh.material = this.materials.bumper;

          if (options && options.rotation) {
              mesh.rotation = new BABYLON.Vector3(options.rotation.x, options.rotation.y, options.rotation.z );
          }
          const aggregate = new BABYLON.PhysicsAggregate(mesh, physicsShape, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);
          for(let i=0; i<this.shadows.length; i++) {
              this.shadows[i].getShadowMap().renderList.push(mesh);
          }
          this.disposables.push(mesh);
          return mesh;

      },
      addHole: function(mesh) {
          const cylinder = BABYLON.MeshBuilder.CreateCylinder("tube", {
              height:10,
              diameterTop:8,
              diameterBottom:8,
              tessellation:16,
              subdivisions:1
          }, this.scene);

          cylinder.position = mesh.position;

          // use Constructive Solid Geometry to subtract tube from ground
          // @TODO - use CSG2 instead (CSG2 not working-  Error while creating the CSG: Not manifold)
          var groundCSG = BABYLON.CSG.FromMesh(mesh);
          var cylinderCSG = BABYLON.CSG.FromMesh(cylinder);

          var hole = groundCSG.subtract(cylinderCSG).toMesh("hole", null, this.scene);
          hole.position = mesh.position;
          hole.material = this.materials.green;
          hole.receiveShadows = true;

          const aggregate = new BABYLON.PhysicsAggregate(hole, BABYLON.PhysicsShapeType.MESH, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);

          cylinder.dispose();
          mesh.dispose(); // delete the original mesh

          const trigger = BABYLON.MeshBuilder.CreateBox("trigger", {height: 1, width:8, depth:8}, this.scene);
          trigger.position = new BABYLON.Vector3(hole.position.x, hole.position.y-5, hole.position.z);
          trigger.actionManager = new BABYLON.ActionManager(this.scene);

          trigger.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
                  trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                  parameter: this.ball
              }, () => {
                setTimeout(() => {
                  this.ball.stop();
                  this.ball.events.dispatchEvent(new Event('hole'))
                }, "1000");
              },
          ));
          this.disposables.push(trigger);
          this.disposables.push(hole);
          return hole;
      },
      addTunnel(x,y,z,options) {
          const box = BABYLON.MeshBuilder.CreateBox("box", {
              width: this.globals.tileSize+1,
              height: this.globals.bumperHeight,
              depth: 10}, this.scene);
          box.position = new BABYLON.Vector3(x, y, z);
          const cylinder = BABYLON.MeshBuilder.CreateCylinder("tube", {
              height:10,
              diameterTop:8,
              diameterBottom:8,
              tessellation:16,
              subdivisions:1
          }, this.scene);

          cylinder.position = new BABYLON.Vector3(x, y + 3, z - 1); // @todo -
          cylinder.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);

          var boxCSG = BABYLON.CSG.FromMesh(box);
          var cylinderCSG = BABYLON.CSG.FromMesh(cylinder);
          var tunnel = boxCSG.subtract(cylinderCSG).toMesh("tunnel", null, this.scene);
          tunnel.position = new BABYLON.Vector3(x, y, z);
          var rotation = options && options.rotation ? new BABYLON.Vector3(0, options.rotation, 0) : BABYLON.Vector3.Zero();
          tunnel.rotation.copyFrom(rotation);

          tunnel.material = this.materials.bumper;
          //tunnel.receiveShadows = true;

          new BABYLON.PhysicsAggregate(tunnel, BABYLON.PhysicsShapeType.MESH, {
              mass: 0,
              restitution: 0,
              friction: 0 }, this.scene);

          for(let i=0; i<this.shadows.length; i++) {
              this.shadows[i].getShadowMap().renderList.push(tunnel);
          }
          cylinder.dispose();
          box.dispose(); // delete the original mesh

          if (options && options.target) {
              let ball = this.ball;
              const trigger = BABYLON.MeshBuilder.CreateBox("trigger", {height: 8, width:8, depth:2}, this.scene);
              trigger.rotation.copyFrom(rotation);
              let offset = new BABYLON.Vector3(4 * Math.sin(rotation.y).toFixed(3), 1, 4 * Math.cos(rotation.y).toFixed(3));
              trigger.position = new BABYLON.Vector3(tunnel.position.x, tunnel.position.y, tunnel.position.z).add(offset);
              trigger.material = this.materials.shadow;
              trigger.actionManager = new BABYLON.ActionManager(this.scene);
              trigger.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
                      trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                      parameter: this.ball.mesh
                  }, () => {
                      let outlet = options.target.position.add(new BABYLON.Vector3(0, 3, 0));
                      let secs = (BABYLON.Vector3.Distance(trigger.position,outlet)/20).toFixed(0);

                      //console.log('secs=' + secs)

                      BABYLON.Animation.CreateAndStartAnimation('cam', ball.mesh, 'position',
                          30, // FPS
                          30*secs, // Total frames
                          trigger.position, outlet, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                      ball.mesh.isVisible = false;

                      let q = options.target.absoluteRotationQuaternion
                      let angles = q.toEulerAngles();
                      let angle = (angles.y + Math.PI/2).toFixed(3);
                      let amount = (options.exitVelocity ? options.exitVelocity : this.globals.exitVelocity)+(Math.random() * 20);

                      setTimeout(() => {
                          //console.log('tunnel impulse angle=' + angle)
                          ball.mesh.isVisible = true;
                          ball.stop();
                          ball.mesh.setAbsolutePosition(outlet);

                          console.log('amount='+ amount);

                          // not sure why the -sin is needed here
                          let impulse = new BABYLON.Vector3(amount * Math.cos(angle), 0, amount * -Math.sin(angle));
                          ball.body.applyImpulse(impulse, ball.mesh.position);
                      }, 1000*secs); // see Total frames
                    },
                  ));
                  this.disposables.push(trigger);
                }

          this.disposables.push(tunnel);
          return tunnel;
      }


  }

  return game;
}

export default Game;
