declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus' {
  export const ElMessage: any
  export const ElMessageBox: any
  // 添加其他需要的 Element Plus 组件
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any
  export default zhCn
}

declare module '@element-plus/icons-vue' {
  export const HomeFilled: any
  export const Monitor: any
  export const VideoCamera: any
  export const View: any
  export const UserFilled: any
  export const ArrowLeft: any
  export const ArrowRight: any
  // 添加其他需要的图标组件
} 