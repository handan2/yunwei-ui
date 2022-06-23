开发环境配置：
配置utils/constant.jsx->env='dev'
影响了BackLayout.jsx的菜单、OperateButton.jsx的按钮、QueryCondition.jsx的查询、session.js的getItem

开发环境直接访问：localhost:8000/back

开发步骤：
第一步：拷贝SysDic/SysDept目录
第二步：修改utils下的path.js
第三步：配置layouts/BackLyout.jsx中的菜单导航

开发时注释，部署时放开:.umirc.ts中的base,publicPath

