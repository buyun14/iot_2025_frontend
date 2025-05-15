import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DeviceList from '../views/DeviceList.vue';
import Scene3DView from '../views/Scene3DView.vue';
import MqttTopicList from '@/views/MqttTopicList.vue';
import SmartDevices from '@/views/SmartDevices.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首页',
        requiresAuth: true
      }
    },
    {
      path: '/devices',
      name: 'devices',
      component: DeviceList,
      meta: {
        title: '设备管理',
        requiresAuth: true
      }
    },
    {
      path: '/3d-scene',
      name: '3d-scene',
      component: Scene3DView,
      meta: {
        title: '3D可视化',
        requiresAuth: true
      }
    },
    {
      path: '/mqtt-topics',
      name: 'MqttTopics',
      component: MqttTopicList,
      meta: {
        title: 'MQTT主题管理',
        requiresAuth: true
      }
    },
    {
      path: '/smart-devices',
      name: 'SmartDevices',
      component: SmartDevices,
      meta: {
        title: '智能设备管理'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - IoT Platform`;

  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 这里可以添加认证逻辑
    next();
  } else {
    next();
  }
});

export default router;