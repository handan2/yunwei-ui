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
import * as utils from'../utils';
//const utils = import('../utils');不可用
export default () => (
  <Layout>
    <Content style={{ background: 'red', height: '350px' }}>
      <Layout style={{padding:'0 16px 0 0 ',}}>
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
                src={"http://10.84.10.17:8888/webroot/decision/view/report?viewlet=test/assert_preview.cpt&user_name="+JSON.parse(sessionStorage.getItem('user')).displayName}
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
      <Layout style={{padding:'0 16px 0 0 ',}} >
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
                  个人信息
                </span>
              }
              style={{
                padding: '20px ',
              }}
              key="1"
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
                     <utils.processDefinitionPath.DefList pageSize = {5} isHome={true} />
              </div>
            </TabPane>
     </Tabs>
        </Sider>
      </Layout>
    </Content>

    <Footer>  Copyright©三十三所网络运维中心 All Rights Reserved  </Footer>
  </Layout>
);
