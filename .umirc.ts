import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'all'
  },
  targets: {
    ie: 11,
    firefox: 39
  },
  routes: [
    { path: '/login', component: '@/pages/SysUser/Login' },
    { path: '/back', component: '@/layouts/BackLayout' },
    { path: '/sysUser/ssologin', component: '@/pages/SysUser/SSOLogin' },
  ],
  title: 'IT运维管理系统',
  fastRefresh: {},
  proxy: {
    '/yunwei': {//调试时浏览器URL里不要加/yunwei
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  },
  // mfsu: {},用了msfsu，火狐47访问不了
  /*
    部署时打开注释
    base:页面路由前缀
    publicPath:css、js、图片等静态资源文件的前缀
    20211128 如果调试运行时不注释，那页面会访问成后端的Static里的前端文件：可能是因为调试时，运行的机制也是加载.js.css文件这种
   */
  // base: '/yunwei/',
  // publicPath: '/yunwei/'
});
