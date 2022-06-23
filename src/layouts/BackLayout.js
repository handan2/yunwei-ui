import React, { useState, useEffect } from 'react'
import { Avatar, Button, Card, ConfigProvider, Dropdown, Icon, Layout, Menu, message, Modal, Tabs } from 'antd'
import { Dialog, Input } from 'nowrapper/lib/antd'
import Form, { FormItem } from 'noform'
import zhCN from 'antd/es/locale/zh_CN'
import Logo1 from '../assets/logo1.jpg'
//全局样式
import './global.less'

import _ from 'lodash'
import { history, useModel } from 'umi'
import DefaultPage from './DefaultPage'
// const utils = require('../utils')
import * as utils from '../utils'

const { Header, Sider, Content } = Layout

//为了解决关闭tab,setActiveKey没有起作用问题
let flagKey
//export default  () => {
export default  function() {
  const [collapsed, setCollapsed] = useState(false)
  const { tabPanes, setTabPanes } = useModel('useTabPanes')
  const { activeKey, setActiveKey } = useModel('useTabPanes')
  const [openKeys, setOpenKeys] = useState([])
  let rootSubmenuKeys = []
  const onClick = ({ key }) => {
    setActiveKey(key)
    if (tabPanes.indexOf(key) >= 0) {
    } else {
      let arr = [...tabPanes]
      arr.push(key)
      setTabPanes(arr)
    }
  }

  const renderMenu = (menuList) => {
    if (utils.env === 'dev') {
      openKeys.push('xxxx')
      return <Menu.SubMenu
        key="xxxx"
        title={<span><Icon type="setting"/><span>测试管理</span></span>}
        onClick={onClick}
      >
        <Menu.Item key="1-数据字典-sysDicPath">数据字典</Menu.Item>
        <Menu.Item key="2-部门管理-sysDeptPath">部门管理</Menu.Item>
        <Menu.Item key="3-角色管理-sysRolePath">角色管理</Menu.Item>
        <Menu.Item key="4-菜单管理-sysPermissionPath">菜单管理</Menu.Item>
        <Menu.Item key="5-用户管理-sysUserPath">用户管理</Menu.Item>
        <Menu.Item key="6-自定义表类型管理-processFormCustomTypePath">自定义表类型</Menu.Item>
        <Menu.Item key="8-流程定义-processDefinitionPath">流程定义</Menu.Item>
        <Menu.Item key="91-流程实例-processInstanceDataPath">流程实例</Menu.Item>
        <Menu.Item key="92-待办任务-processInstanceDataMyPath">待办任务</Menu.Item>
        <Menu.Item key="93-已办任务-processInstanceDataCompletePath">已办任务</Menu.Item>
        <Menu.Item key="10-设备查询-asDeviceCommonPath">设备查询</Menu.Item>
        <Menu.Item key="11-设备履历-lifeCirclePath">设备履历</Menu.Item>
      </Menu.SubMenu>
    }
    return menuList && menuList.map(item => {
      if (item.children) {
        rootSubmenuKeys.push(item.id + '')
        let title
        if (item.icon) {
          title = <span><Icon type={item.icon}/><span>{item.name}</span></span>
        } else {
          title = <span>{item.name}</span>
        }
        return <Menu.SubMenu
          key={item.id}
          title={title}
          onClick={onClick}
        >
          {renderMenu(item.children)}
        </Menu.SubMenu>
      }
      return <Menu.Item key={item.id + '-' + item.name + '-' + item.path}>{'-'+item.name}</Menu.Item>
    })
  }

  const closeTabPane = () => {
    let arr = [...tabPanes]
    //找到下一个tab
    let index = _.findIndex(arr, key => key === activeKey)
    if (index === 0) {
      if (arr.length > 1) {
        flagKey = arr[index + 1]
      } else {
        flagKey = '首页'
      }
    } else {
      flagKey = arr[index - 1]
    }
    _.remove(arr, key => key === activeKey)
    setTabPanes(arr)
    //设置不起作用
    // setActiveKey(flagKey)
  }

  const renderTabPane = () => {
    if (flagKey) {
      setActiveKey(flagKey)
      flagKey = undefined
    }
    return tabPanes.map(key => {
      let [id, name, path] = key.split('-')
      let realPath = utils[path]
      let tab = name
      if (activeKey === key) {
        tab = <span>{name}
          <a onClick={closeTabPane}>
            <Icon type="close" style={{ color: 'rgba(0,0,0,.45)', marginRight: 0, marginLeft: 6 }}/>
          </a>
        </span>
      }
      return <Tabs.TabPane tab={tab} key={key}>
        <div style={{ padding: '0px 12px' }}>
          <Card bordered={false}>
            <realPath.List/>
          </Card>
        </div>
      </Tabs.TabPane>
    })
  }

  useEffect(() => {
    setOpenKeys(rootSubmenuKeys)
  }, [])

  const DropdownMenu = (
    <Menu>
      <Menu.Item>
        <div style={{ float: 'left', width: 20 }}>
          <Icon type="edit"/>
        </div>
        <a onClick={() => {
          Dialog.show({
            title: '修改密码',
            footerAlign: 'label',
            locale: 'zh',
            width: 450,
            content: <Form layout={{ label: 8, control: 16 }}>
              <FormItem label="旧密码" name="oldPassword" required><Input/></FormItem>
              <FormItem label="新密码" name="newPassword" required><Input/></FormItem>
              <FormItem label="确认新密码" name="newPassword2" required><Input/></FormItem>
            </Form>,
            onOk: async (values, hide) => {
              if (!values.oldPassword || !values.newPassword || !values.newPassword2) {
                Modal.error({ content: '密码不能为空' })
                return
              }
              if (values.newPassword !== values.newPassword2) {
                Modal.error({ content: '两次新密码不一致' })
                return
              }
              const data = await utils.ajax.get(utils.sysUserPath.changePassword, values)
              if (data) {
                hide()
                message.success('修改成功')
              }
            }
          })
        }}>修改密码</a>
      </Menu.Item>
    </Menu>
  )

  return <ConfigProvider locale={zhCN}>
    <Layout>
      <Header style={{ backgroundColor: '#1890ff', padding: 0 }}>
        <span className={collapsed ? 'left-none' : 'left-block'}> {collapsed ? 'IT' : '  IT运维管理'}</span>
        <Icon
          className="trigger"
          style={{ color: '#fff',marginLeft:collapsed ?'0px': '45px' }}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={() => {
            setCollapsed(!collapsed)
            !collapsed ? setOpenKeys([]) : setOpenKeys(rootSubmenuKeys)  
          }}
        />
         <img src={Logo1} height='40' width = '50' style = {{marginBottom: '10px' ,marginLeft: '20px'}}></img>
        <span className='title'>三 十 三 所 网 络 运 维 管 理 系 统 V2.0</span>
        <div className='right'>
          <Dropdown overlay={DropdownMenu} className='user'>
          <span>
          <Icon type="user" style={{ paddingRight: 5, fontSize: 20 }}/>
          欢迎你,{utils.env === 'dev' ? 'xxx' : utils.session.getItem('displayName')}
          </span>
          </Dropdown>
          <span className='user'>
            <Button
              type={'link'} icon={'logout'} style={{ color: '#fff', fontSize: 16 }}
              onClick={async () => {
                const data = await utils.ajax.get(utils.sysUserPath.logout)
                if (data) {
                  history.push('/login')
                }
              }}>
              退出登录
            </Button>
          </span>
        </div>
      </Header>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#fff' }}>
          <Menu mode="inline" selectedKeys={[activeKey]} openKeys={openKeys} onOpenChange={(openkeys) => setOpenKeys(openkeys)}>
            {renderMenu(utils.session.getItem('menuList'))}
          </Menu>
        </Sider>
        <Content
          style={{ minHeight: 580 }}
        >
          <Tabs tabBarStyle={{ background: '#fff', height: 55 }}
                activeKey={activeKey}
                animated={false}
                onTabClick={key => setActiveKey(key)}>
            <Tabs.TabPane tab="首页" key="首页">
              <div style={{ padding: '0px 12px' }}>
              <DefaultPage />
              </div>
            </Tabs.TabPane>
            {renderTabPane()}
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  </ConfigProvider>
}
