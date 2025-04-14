<template>
  <div class="scene-container">
    <h1>3D 家居场景与传感器应用</h1>
    <canvas id="sceneCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

onMounted(() => {
  // 初始化场景、相机和渲染器
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const canvas = document.getElementById('sceneCanvas') as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('Canvas element with id "sceneCanvas" not found');
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); // 启用抗锯齿
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // 启用阴影

  // 设置背景颜色为浅灰色
  scene.background = new THREE.Color(0xeeeeee);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 环境光强度
  scene.add(ambientLight);

  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 方向光强度
  directionalLight.position.set(5, 10, 7); // 光源位置
  directionalLight.castShadow = true; // 开启阴影投射
  scene.add(directionalLight);

  // 添加点光源
  const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源强度
  pointLight.position.set(-5, 5, 5); // 点光源位置
  scene.add(pointLight);

  // 创建一个立方体表示家具
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(-2, 0, 0); // 设置位置
  scene.add(cube);

  // 设置相机位置
  camera.position.set(0, 2, 10);

  // 添加 OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 启用阻尼效果

  // 动态加载 GLTF 模型
  const loader = new GLTFLoader();
  loader.load(
    '/models/basic_house_map_gltf/scene.gltf', // 替换为你的模型路径
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(-0.1, -0.1, -0.1); // 缩放模型
      model.position.set(2, 0, 0); // 设置位置
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).castShadow = true; // 开启模型阴影
          (child as THREE.Mesh).receiveShadow = true; // 接收阴影
        }
      });
      scene.add(model);
    },
    undefined,
    (error) => {
      console.error('加载模型时出错:', error);
    }
  );

  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate);

    // 更新控制器
    controls.update();

    renderer.render(scene, camera);
  };

  animate();

  // 清理事件监听器
  onUnmounted(() => {});
});
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#sceneCanvas {
  width: 100%;
  height: 100%;
}
</style>