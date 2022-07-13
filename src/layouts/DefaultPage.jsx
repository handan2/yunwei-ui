import React, { useState } from 'react';
import {
  Button,
  Card,
  ConfigProvider,
  Dropdown,
  Icon,
  Layout,
  Menu,
  message,
  Modal,
  Tabs,
} from 'antd';
import { Descriptions, Statistic, Row, Col, Carousel } from 'antd';
import { Dialog, Input } from 'nowrapper/lib/antd';
import Form, { FormItem } from 'noform';
import zhCN from 'antd/es/locale/zh_CN';
import { onClickForStart } from '../pages/ProcessInstanceData/onClick';
import { ajax, processDefinitionPath, processInstanceDataPath } from '../utils'
//全局样式
import './global.less';

import _ from 'lodash';
import { history, useModel } from 'umi';
import {
  CrownOutlined,
  SettingOutlined,
  UserOutlined,
  LikeOutlined,
  ExportOutlined,
  ThunderboltOutlined,
  ScheduleOutlined,
  TeamOutlined,
  BarChartOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

const { Header, Footer, Sider, Content } = Layout;
const { TabPane } = Tabs;
//const utils = require('../utils');
import * as utils from '../utils';
//const utils = import('../utils');不可用
export default () => {


  const sceneChoose = async (columnName) => {
    const startProcess = async (processName) => {
      if ('计算机入网' === processName) {

        const data = await ajax.get(
          processDefinitionPath.getByName,
          {
            processDefinitionName: '计算机入网',
          },
        );
        onClickForStart(data, 'start')
      }

    }
    if ('新职工入职' === columnName) {
      Dialog.show({
        title: <span>应用场景——新职工入职流程指南 <Icon type="tag" /></span>,
        footerAlign: 'right',
        locale: 'zh',
        enableValidate: true,
        width: 650,

        content: (
          <div
            style={{
              marginTop: '-20px',
              // cursor: 'pointer',
              background: 'WhiteSmoke',
              height: '300px',
              //lineHeight: '400px',
              fontSize: '16px',
              verticalAlign: 'middle',
              display: 'table-cell',//这两个是为了垂直居中
              //textAlign: 'center',
              //color: 'white'
              // wordBreak: 'break-all'
            }}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;作为一名新员工，你首先可能需要申领一台或几台办公电脑，那么请发起<a style={{ fontSize: '22px' }} onClick={() => { startProcess('计算机入网') }} >计算机申领流程</a>；同时，你还需要通过发起<a style={{ fontSize: '22px' }}>新用户入网流程</a>申请建立主机登陆用户及申请登陆密钥。值得注意的是，<a style={{ fontSize: '22px' }}>新用户入网流程</a>会自动帮你开通智企、邮件等应用系统的使用权限，但你如果还需要使用SAP/ERP、TC等应用系统，那么你还需要再自助发起<a style={{ fontSize: '22px' }}>应用系统用户变更流程</a>以建立相关用户哦 <Icon type="smile" style={{ fontSize: '18px', color: 'black' }} theme="outlined" />。

          </div>

        ),
        footer: (hide, { _, ctx: core }) => { }
      })
    }


  }
  // const columnDataSource = [{title:'新职工入职',sort:1,icon:<UserOutlined/>,highlight}]
  return <div>
    <Layout>
      <Content style={{ background: 'red', height: '350px' }}>
        <Layout style={{ padding: '0 16px 0 0 ', }}>
          <Sider
            id="indexFirstCard"
            width={'50%'}
            //min-width={'50px'}//20210508
            style={{
              margin: '0 12px 12px 0 ',
              backgroundColor: 'white',
              //height: '100%',
              //  overflow: 'scroll'

            }}
          >
            <Tabs type="card" tabBarStyle={{ margin: '0' }}>
              <TabPane
                style={{
                  //height: '310px',//设置了高度，第二个tabPane就被挤到下方去了，暂不研
                  //overflowY: 'scroll'

                  //backgroundColor: '#f0f2f5',
                  backgroundColor: '#f0f2f5',
                }}
                tab={
                  <span>
                    <ExportOutlined />
                  待办事项
                </span>
                }
                key="1"
              >
                <div
                  style={{
                    height: '305px',
                    backgroundColor: 'white',
                  }}
                >
                  <utils.processInstanceDataMyPath.TodoList />
                </div>
              </TabPane>
              <TabPane
                style={{
                  //height: '310px',//设置了高度，第二个tabPane就被挤到下方去了，暂不研
                  //overflowY: 'scroll'

                  backgroundColor: '#f0f2f5',
                }}
                tab={
                  <span>
                    <ScheduleOutlined />
                  已办事项
                </span>
                }
                key="2"
              >
                <div
                  style={{
                    height: '305px',
                    backgroundColor: 'white',
                  }}
                >
                  <utils.processInstanceDataCompletePath.DoneList />
                </div>
              </TabPane>
            </Tabs>
          </Sider>
          <Sider
            //id="indexSecondCard"
            width={'50%'}
            style={{
              margin: '0 8px 10px 0 ',
              background: '#ffffff',
            }}
          >
            <Tabs type="card" tabBarStyle={{ margin: '0' }}>
              <TabPane
                tab={
                  <span>
                    <BarChartOutlined />
                  资产概览
                </span>
                }
                style={{
                  backgroundColor: '#f0f2f5', //tabpane有一个恶心的底部默认5px左右的填充空白区域（且不是margin/pading之类），我先给他个基色填充了，暂不研
                }}
                key="1"
              >
                <iframe
                  src={"http://10.84.10.17:8888/webroot/decision/view/report?viewlet=test/assert_preview.cpt&user_name=" + JSON.parse(sessionStorage.getItem('user')).displayName}
                  width="100%"
                  height="305px"
                  frameborder="no"
                  border="0"
                ></iframe>
              </TabPane>
            </Tabs>
          </Sider>
        </Layout>
      </Content>
      <Content>
        <Layout style={{ padding: '0 16px 0 0 ', }} >
          <Sider
            width={'50%'}
            height="350px"
            style={{
              margin: '12px 12px 0 0 ',
              backgroundColor: 'white',
            }}
          >
            <Tabs type="card" tabBarStyle={{ margin: '0' }}>
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                  应用场景
                </span>
                }
                style={{
                  padding: '20px ',
                }}
                key="1"
              >
                <Row gutter={[10, 10]}>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(to right,#9fdffb,#00a0e9)',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white',
                    borderTopLeftRadius: '10px'
                  }} onClick={() => { sceneChoose('新职工入职') }} ><UserOutlined />  新职工入职</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white'
                  }}> <UserOutlined /> 员工离职</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white'
                  }}><UserOutlined />  员工换部门</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white',
                    background: 'linear-gradient(to left,#9fdffb,#00a0e9)',
                    borderTopRightRadius: '10px'
                  }}><UserOutlined />   员工密级变更</div></Col>

                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white'
                  }}><CrownOutlined />  设备挪动地方</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: 'orange',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white',

                  }}><CrownOutlined />  终端故障报修</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white'
                  }}><CrownOutlined />  连接打印机</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white'
                  }}><CrownOutlined />  连接扫描仪</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white',
                    background: 'linear-gradient(to right,#9fdffb,#00a0e9)',
                    borderBottomLeftRadius: '10px'
                  }}><CrownOutlined />  连接测试设备</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white',

                  }}><CrownOutlined />  其他</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white'
                  }}><CrownOutlined />  其他</div></Col>
                  <Col span={6} >  <div style={{
                    cursor: 'pointer',
                    background: '#00a0e9',
                    height: '80px',
                    lineHeight: '80px',
                    fontSize: '16px',
                    textAlign: 'center',
                    color: 'white',
                    background: 'linear-gradient(to left,#9fdffb,#00a0e9)',
                    borderBottomRightRadius: '10px'
                  }}><CrownOutlined />  其他</div></Col>
                </Row>

                {/* </Descriptions> */}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                  个人信息
                </span>
                }
                style={{
                  padding: '20px ',
                }}
                key="2"
              >
                <Row />
                <Row />
                <Row gutter={28}>
                  <Col span={2} />
                  <Col span={10}>
                    <Statistic
                      title="您的评分"
                      value={1000}
                      prefix={<Icon type="like" />}
                    />
                  </Col>
                  <Col span={10}>
                    <Statistic title="您的排行" value={1} suffix="/ 1000" />
                  </Col>
                </Row>
                <Row />
                <Row />
                <Row />

                <Descriptions
                  size="small"
                  column={2}
                  style={{ padding: '10px 0 0 40px ' }}
                >
                  <Descriptions.Item label="用户姓名">
                    {JSON.parse(sessionStorage.getItem('user')).displayName}
                  </Descriptions.Item>
                  <Descriptions.Item label="登陆名称">
                    {JSON.parse(sessionStorage.getItem('user')).loginName}
                  </Descriptions.Item>
                  <Descriptions.Item label="所在部门">
                    {JSON.parse(sessionStorage.getItem('user')).temp}
                  </Descriptions.Item>
                  <Descriptions.Item label="人员密级">
                    {JSON.parse(sessionStorage.getItem('user')).secretDegree}
                  </Descriptions.Item>
                  <Descriptions.Item label="账号状态">
                    {JSON.parse(sessionStorage.getItem('user')).status}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {JSON.parse(sessionStorage.getItem('user')).createDatetime}
                  </Descriptions.Item>
                  <Descriptions.Item label="备注">
                    北京市丰台区云岗西路一号院
                </Descriptions.Item>
                </Descriptions>
                {/* </Descriptions> */}
              </TabPane>
            </Tabs>
          </Sider>
          <Sider
            width={'50%'}
            height="350px"
            style={{
              margin: '12px 8px 0 0 ',
              backgroundColor: 'white',
            }}
          >
            <Tabs type="card" tabBarStyle={{ margin: '0' }}>
              <TabPane
                style={{
                  //height: '310px',//设置了高度，第二个tabPane就被挤到下方去了，暂不研
                  //overflowY: 'scroll'

                  //backgroundColor: '#f0f2f5',
                  backgroundColor: '#f0f2f5',
                }}
                tab={
                  <span>
                    <ThunderboltOutlined />
                  快速入口
                </span>
                }
                key="1"
              >
                <div
                  style={{
                    height: '305px',
                    backgroundColor: 'white',
                  }}
                >
                  <utils.processDefinitionPath.DefList pageSize={5} isHome={true} />
                </div>
              </TabPane>
            </Tabs>
          </Sider>
        </Layout>
      </Content>

      <Content>
        <Layout>
          <Sider width={'90%'} style={{ backgroundColor: '#f0f2f5' }}>
            <Footer style={{
              textAlign: 'center',
            }}><p>Copyright©三十三所网络运维中心 All Rights Reserved </p> </Footer>
          </Sider>
          <Sider width={'10%'} style={{ backgroundColor: '#f0f2f5' }}>
            <Footer style={{textAlign: 'right',padding: '24px 10px 24px 0px' }}>
              <a onClick={() => Dialog.show({
                title: <span>新版运维管理系统帮助手册 <Icon type="tag" /></span>,
                footerAlign: 'right',
                locale: 'zh',
                enableValidate: true,
                width: 650,
                style: { background: 'WhiteSmoke', marginTop: '0px' },//没起作用
                content: (
                  <div
                    style={{
                      marginTop: '-20px',
                      // cursor: 'pointer',
                      background: 'WhiteSmoke',
                      height: '300px',
                      //lineHeight: '400px',
                      fontSize: '16px',
                      verticalAlign: 'middle',
                      display: 'table-cell',//这两个是为了垂直居中
                      //textAlign: 'center',
                      //color: 'white'
                      // wordBreak: 'break-all'
                    }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;你好，这里是使用帮助说明 。你好，这里是使用帮助说明 。你好，这里是使用帮助说明 。<Icon type="smile" style={{ fontSize: '18px', color: 'black' }} theme="outlined" />

                  </div>),
                footer: (hide, { _, ctx: core }) => { }
              })} style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '14px' }}><Icon type="read" />  帮助文档 </a>
            </Footer>
          </Sider>
        </Layout>
      </Content>

    </Layout>
  </div>
};
