// Jogo 3D da Abelha - Abelha Realista com Orientação Correta e Controles Simultâneos
class BeeGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.bee = null;
    this.beeWings = [];
    this.flowers = [];
    this.wasps = [];
    this.trees = [];

    this.score = 0;
    this.health = 100;
    this.isPlaying = false;

    this.worldSize = 140;
    this.maxScore = 12;

    this.initEngine();
    this.initLights();
    this.createEnvironment();
    this.createRealisticBee();
    this.initUI();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initEngine() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.006);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 6, 14);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(this.renderer.domElement);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xfffaed, 0.7);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x558833, 0.6);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaf0, 1.5);
    dirLight.position.set(60, 120, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 350;
    const d = 70;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    const beeFillLight = new THREE.PointLight(0xffea75, 1.2, 12);
    beeFillLight.position.set(0, 3, 3);
    this.scene.add(beeFillLight);
    this.beeFillLight = beeFillLight;
  }

  createEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(this.worldSize, this.worldSize, 64, 64);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const z = Math.sin(vx * 0.04) * Math.cos(vy * 0.04) * 1.8;
      pos.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x479123, 
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * (this.worldSize - 16);
      const z = (Math.random() - 0.5) * (this.worldSize - 16);
      if (Math.abs(x) < 14 && Math.abs(z) < 14) continue;
      this.createStylizedTree(x, z);
    }

    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * (this.worldSize - 10);
      const z = (Math.random() - 0.5) * (this.worldSize - 10);
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
      this.createRockOrMushroom(x, z);
    }
  }

  createStylizedTree(x, z) {
    const group = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.9, 1.5, 8, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    const leavesColors = [0x1e4620, 0x275a2b, 0x316e35];
    const color = leavesColors[Math.floor(Math.random() * leavesColors.length)];

    for (let j = 0; j < 3; j++) {
      const radius = 3.8 - j * 0.8;
      const coneGeo = new THREE.ConeGeometry(radius, 4, 8);
      const coneMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 6 + j * 2.5;
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(cone);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.trees.push(group);
  }

  createRockOrMushroom(x, z) {
    const group = new THREE.Group();
    if (Math.random() > 0.5) {
      const rockGeo = new THREE.DodecahedronGeometry(0.9 + Math.random() * 0.7, 1);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.8 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.y = 0.6;
      rock.castShadow = true;
      rock.receiveShadow = true;
      group.add(rock);
    } else {
      const stemGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.9, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xf1f2f6 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.45;
      group.add(stem);

      const capGeo = new THREE.SphereGeometry(0.9, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.4 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.9;
      cap.castShadow = true;
      group.add(cap);
    }
    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createRealisticBee() {
    this.bee = new THREE.Group();

    // NOTA: No sistema de coordenadas do Three.js, a frente padrão é +Z.
    // Para que a abelha olhe corretamente para a direção do movimento (+Z),
    // construímos o corpo dela perfeitamente alinhado ao longo do eixo Z.

    // 1. Abdômen (Traseira amarela com listras pretas - -Z)
    const abdomenGeo = new THREE.SphereGeometry(0.75, 20, 20);
    abdomenGeo.scale(1, 0.95, 1.4);
    const abdomenMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4 });
    const abdomen = new THREE.Mesh(abdomenGeo, abdomenMat);
    abdomen.position.set(0, -0.05, -0.75);
    abdomen.castShadow = true;
    this.bee.add(abdomen);

    // Listras pretas no abdômen
    for (let i = -0.4; i <= 0.4; i += 0.25) {
      const stripeGeo = new THREE.CylinderGeometry(0.72, 0.76, 0.14, 16);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.set(0, -0.05, -0.5 + i);
      this.bee.add(stripe);
    }

    // Ferrão na ponta traseira (-Z)
    const stingerGeo = new THREE.ConeGeometry(0.08, 0.35, 8);
    const stingerMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const stinger = new THREE.Mesh(stingerGeo, stingerMat);
    stinger.rotation.x = -Math.PI / 2;
    stinger.position.set(0, -0.05, -1.5);
    this.bee.add(stinger);

    // 2. Tórax (Centro felpudo marrom/dourado - Z = 0)
    const thoraxGeo = new THREE.SphereGeometry(0.65, 20, 20);
    thoraxGeo.scale(1, 0.9, 1.1);
    const thoraxMat = new THREE.MeshStandardMaterial({ color: 0xc67d0a, roughness: 0.9 });
    const thorax = new THREE.Mesh(thoraxGeo, thoraxMat);
    thorax.position.set(0, 0, 0.1);
    thorax.castShadow = true;
    this.bee.add(thorax);

    // 3. Cabeça (Frente da abelha - +Z)
    const headGeo = new THREE.SphereGeometry(0.48, 18, 18);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x2b1708, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0, 0.85);
    head.castShadow = true;
    this.bee.add(head);

    // Olhos compostos facetados escuros e brilhantes (+Z)
    const eyeGeo = new THREE.SphereGeometry(0.19, 14, 14);
    eyeGeo.scale(0.7, 1.3, 1);
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0f0f0f, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 });
    
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(0.28, 0.08, 1.02);
    eyeLeft.rotation.y = 0.25;
    this.bee.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(-0.28, 0.08, 1.02);
    eyeRight.rotation.y = -0.25;
    this.bee.add(eyeRight);

    // Antenas detalhadas (+Z)
    const antennaGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    const antL = new THREE.Mesh(antennaGeo, antennaMat);
    antL.position.set(0.18, 0.38, 1.15);
    antL.rotation.z = -0.3;
    antL.rotation.x = 0.5;
    this.bee.add(antL);

    const antR = new THREE.Mesh(antennaGeo, antennaMat);
    antR.position.set(-0.18, 0.38, 1.15);
    antR.rotation.z = 0.3;
    antR.rotation.x = 0.5;
    this.bee.add(antR);

    // 4. Pernas articuladas
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1f1207, roughness: 0.8 });
    for (let side of [-1, 1]) {
      const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.6);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.rotation.z = side * 0.7;
      leg.position.set(side * 0.35, -0.35, 0.1);
      this.bee.add(leg);
    }

    // 5. Asas translúcidas detalhadas (acima do tórax)
    const wingGeo = new THREE.BoxGeometry(1.4, 0.02, 0.7);
    wingGeo.translate(0.7, 0, 0);
    const wingMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.6, 
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.25,
      side: THREE.DoubleSide 
    });
    
    const wingLeft = new THREE.Mesh(wingGeo, wingMat);
    wingLeft.position.set(0.08, 0.55, 0.2);
    wingLeft.rotation.y = 0.1;
    this.bee.add(wingLeft);

    const wingRight = new THREE.Mesh(wingGeo, wingMat);
    wingRight.scale.set(-1, 1, 1);
    wingRight.position.set(-0.08, 0.55, 0.2);
    wingRight.rotation.y = -0.1;
    this.bee.add(wingRight);

    this.beeWings = [wingLeft, wingRight];

    this.bee.position.set(0, 3, 0);
    this.scene.add(this.bee);
  }

  spawnFlowers() {
    this.flowers.forEach(f => this.scene.remove(f));
    this.flowers = [];

    for (let i = 0; i < this.maxScore; i++) {
      const flower = new THREE.Group();

      const stemGeo = new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x388659, roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 1.1;
      stem.castShadow = true;
      flower.add(stem);

      const centerGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xffe600, emissive: 0xffb703, emissiveIntensity: 0.5, roughness: 0.2 });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.y = 2.3;
      flower.add(center);

      for (let p = 0; p < 6; p++) {
        const petalGeo = new THREE.ConeGeometry(0.4, 0.9, 5);
        petalGeo.translate(0, 0.4, 0);
        const petalMat = new THREE.MeshStandardMaterial({ 
          color: p % 2 === 0 ? 0xff7b00 : 0xffa200, 
          roughness: 0.4 
        });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.y = 2.2;
        petal.rotation.x = Math.PI / 2.5;
        petal.rotation.z = (p * Math.PI * 2) / 6;
        flower.add(petal);
      }

      const x = (Math.random() - 0.5) * (this.worldSize - 20);
      const z = (Math.random() - 0.5) * (this.worldSize - 20);
      flower.position.set(x, 0, z);

      this.scene.add(flower);
      this.flowers.push(flower);
    }
  }

  spawnWasps() {
    this.wasps.forEach(w => this.scene.remove(w));
    this.wasps = [];

    for (let i = 0; i < 9; i++) {
      const wasp = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(0.7, 16, 16);
      bodyGeo.scale(1, 1, 1.4);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      wasp.add(body);

      for (let s = -0.25; s <= 0.3; s += 0.28) {
        const stripeGeo = new THREE.CylinderGeometry(0.71, 0.74, 0.16, 12);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = Math.PI / 2;
        stripe.position.set(0, 0, s);
        wasp.add(stripe);
      }

      const x = (Math.random() - 0.5) * (this.worldSize - 20);
      const z = (Math.random() - 0.5) * (this.worldSize - 20);
      const y = 1.5 + Math.random() * 5;
      wasp.position.set(x, y, z);

      wasp.userData = {
        speed: 0.05 + Math.random() * 0.04,
        angle: Math.random() * Math.PI * 2,
        radius: 6 + Math.random() * 12,
        centerX: x,
        centerZ: z
      };

      this.scene.add(wasp);
      this.wasps.push(wasp);
    }
  }

  startGame() {
    sounds.init();
    this.score = 0;
    this.health = 100;
    this.bee.position.set(0, 3, 0);
    this.updateHUD();

    this.spawnFlowers();
    this.spawnWasps();

    document.getElementById('message-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    this.isPlaying = true;
  }

  gameOver(win) {
    this.isPlaying = false;
    const screen = document.getElementById('gameover-screen');
    const title = document.getElementById('go-title');
    const text = document.getElementById('go-text');

    if (win) {
      title.textContent = '🏆 Vitória Gloriosa!';
      text.textContent = 'Parabéns! Você coletou todo o néctar!';
      sounds.playWin();
    } else {
      title.textContent = '💀 Fim de Jogo';
      text.textContent = 'Suas forças se esgotaram!';
      sounds.playOver();
    }

    screen.classList.remove('hidden');
  }

  updateHUD() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('health').textContent = Math.max(0, Math.round(this.health));
  }

  initUI() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (this.isPlaying) {
      const speed = 0.28;
      const moveX = controls.moveX;
      const moveZ = controls.moveZ;
      const moveY = controls.moveY;

      // Movimentação simultânea perfeita (Horizontal + Vertical)
      this.bee.position.x += moveX * speed;
      this.bee.position.z += moveZ * speed;
      this.bee.position.y += moveY * 0.22;

      if (this.beeFillLight) {
        this.beeFillLight.position.copy(this.bee.position).add(new THREE.Vector3(0, 2.5, 3));
      }

      const halfWorld = this.worldSize / 2 - 6;
      this.bee.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.bee.position.x));
      this.bee.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.bee.position.z));
      this.bee.position.y = Math.max(0.8, Math.min(22, this.bee.position.y));

      // Orientação impecável: Abelha olha exatamente para onde está andando
      if (Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05) {
        const targetRotationY = Math.atan2(moveX, moveZ);
        let diff = targetRotationY - this.bee.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.bee.rotation.y += diff * 0.18;

        // Inclinação lateral ao curvar e inclinação vertical ao subir/descer
        this.bee.rotation.z = -moveX * 0.35;
        this.bee.rotation.x = moveY * 0.25;
      } else {
        this.bee.rotation.z *= 0.85;
        this.bee.rotation.x *= 0.85;
      }

      // Asas batendo rapidamente
      const wingSpeed = 60;
      const time = Date.now() * 0.01;
      if (this.beeWings.length === 2) {
        this.beeWings[0].rotation.z = Math.sin(time * wingSpeed) * 0.75;
        this.beeWings[1].rotation.z = -Math.sin(time * wingSpeed) * 0.75;
      }

      // Câmera cinematográfica suave
      const targetCamPos = new THREE.Vector3(
        this.bee.position.x,
        this.bee.position.y + 4.5,
        this.bee.position.z - 11
      );
      this.camera.position.lerp(targetCamPos, 0.12);
      this.camera.lookAt(this.bee.position.clone().add(new THREE.Vector3(0, 1, 1)));

      // Vespas
      this.wasps.forEach(wasp => {
        const data = wasp.userData;
        data.angle += data.speed;
        wasp.position.x = data.centerX + Math.cos(data.angle) * data.radius;
        wasp.position.z = data.centerZ + Math.sin(data.angle) * data.radius;
        wasp.position.y += Math.sin(data.angle * 2) * 0.02;

        if (wasp.position.distanceTo(this.bee.position) < 1.6) {
          this.health -= 0.6;
          sounds.playHit();
          this.updateHUD();
          if (this.health <= 0) {
            this.gameOver(false);
          }
        }
      });

      // Flores
      this.flowers.forEach((flower) => {
        if (flower.visible) {
          flower.rotation.y += 0.01;
          if (flower.position.distanceTo(this.bee.position) < 1.9) {
            flower.visible = false;
            this.score++;
            sounds.playCollect();
            this.updateHUD();

            if (this.score >= this.maxScore) {
              this.gameOver(true);
            }
          }
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('load', () => {
  window.game = new BeeGame();
});