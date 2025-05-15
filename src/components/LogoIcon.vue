<script setup lang="ts">
defineOptions({
  name: 'LogoIcon'
})
</script>

<template>
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="width: 1em; height: 1em;"
  >
    <!-- 房屋主体 -->
    <path d="M100 20L20 80V180H180V80L100 20Z" fill="#4A90E2" stroke="#2C3E50" stroke-width="3"/>

    <!-- 门 -->
    <rect x="85" y="120" width="30" height="60" fill="#E74C3C" stroke="#2C3E50" stroke-width="1.5"/>

    <!-- 窗户 -->
    <rect x="40" y="100" width="30" height="30" fill="#3498DB" stroke="#2C3E50" stroke-width="1.5"/>
    <rect x="130" y="100" width="30" height="30" fill="#3498DB" stroke="#2C3E50" stroke-width="1.5"/>

    <!-- 智能设备图标 -->
    <circle cx="50" cy="50" r="12" fill="#2ECC71" stroke="#2C3E50" stroke-width="1.5"/>
    <circle cx="150" cy="50" r="12" fill="#E67E22" stroke="#2C3E50" stroke-width="1.5"/>

    <!-- 连接线 -->
    <path d="M50 50L100 20L150 50" stroke="#2C3E50" stroke-width="1.5" stroke-dasharray="3 3"/>

    <!-- 智能控制点 -->
    <circle cx="100" cy="100" r="8" fill="#9B59B6" stroke="#2C3E50" stroke-width="1.5"/>
    <path d="M97 100L103 100M100 97L100 103" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>
</template>
