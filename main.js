'use strict';
/* global THREE */


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function drawCheckered(){
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 4;
  ctx.canvas.height = 4;
  ctx.fillRect(0, 0, 4, 4);
  ctx.fillStyle = getRandomColor();
  ctx.fillRect(0, 0, 2, 2);
  ctx.fillRect(2, 2, 2, 2);
  const checker = new THREE.CanvasTexture(ctx.canvas);
  checker.magFilter = THREE.NearestFilter;
  checker.repeat.x = 15;
  checker.repeat.y = 800;
  checker.wrapS =  THREE.RepeatWrapping;
  checker.wrapT =  THREE.RepeatWrapping;
  const sphereGeo = new THREE.CylinderBufferGeometry(1, 1, 300, 24, 1);
  const sphereMat = new THREE.MeshBasicMaterial({
    map: checker, 
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(sphereGeo, sphereMat);
}

function main() {
  const texturesBall = ['https://i.imgur.com/ruNffCV.jpg','https://i.imgur.com/zWlljlz.jpg','https://i.imgur.com/Hga5gsl.png','https://i.imgur.com/vQlwh70.png','https://i.imgur.com/RdgZqjx.jpg','https://i.imgur.com/NKodCPG.jpg','https://i.imgur.com/6suWljJ.jpg'];
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas: canvas});
  renderer.autoClearColor = false;
  var dxPerFrame = 1;
  var moveInY = true;
  var movement = false;

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0,6,0);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const mainScene = new THREE.Scene();
  const objectsScene = new THREE.Scene();
  const objectsCamera = new THREE.CubeCamera(0.1, 100, 2048);
  objectsScene.add(objectsCamera);

  createBg();

  const bgScene = new THREE.Scene();
  let bgCheckered;
  const shader = THREE.ShaderLib.cube;
	const material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: true,
      side: THREE.BackSide,
  });
	material.uniforms.tCube.value = objectsCamera.renderTarget.texture;
  const plane = new THREE.BoxBufferGeometry(2, 2, 2);
  bgCheckered = new THREE.Mesh(plane, material);
  bgScene.add(bgCheckered);

  var geometryBall = new THREE.SphereGeometry(2, 20, 20);
  
  const loader = new THREE.TextureLoader();

  var materialBall = new THREE.MeshBasicMaterial({
    map: loader.load(texturesBall[Math.floor(Math.random() * 7)]),
  });

  var ball = new THREE.Mesh(geometryBall, materialBall);
  bgScene.add(ball);

  function handleKeyDown(keyEvent){
    if ( keyEvent.keyCode === 66){
      createBg();
    } else if (keyEvent.keyCode == 32){
      moveInY = !moveInY;
    } else if (keyEvent.keyCode == 13){
      movement = !movement;
    } else if (keyEvent.keyCode == 84){
      ball.material.map = loader.load(texturesBall[Math.floor(Math.random() * 7)]);
    }
  }

  function createBg(){
    const tunnelCheckered = drawCheckered();
    objectsScene.add(tunnelCheckered);
    objectsCamera.update(renderer, objectsScene);
  }

  function render(time) {
    document.onkeydown = handleKeyDown;
    time *= 0.001;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    ball.rotation.x += 0.01;
    ball.rotation.y += 0.01;
    if (needResize) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    if (moveInY && movement){
      ball.position.y += dxPerFrame;
      if(ball.position.y >  100) dxPerFrame = -1; 
      if(ball.position.y < -100) dxPerFrame =  1;
    } else if (movement) {
      ball.position.x += dxPerFrame; 
      if(ball.position.x >  100) dxPerFrame = -1; 
      if(ball.position.x < -100) dxPerFrame =  1;
    }
    
    bgCheckered.position.copy(camera.position);
    renderer.render(bgScene, camera);
    renderer.render(mainScene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
