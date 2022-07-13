import React, { useState } from 'react'
import { Button, message, Modal, Steps ,Row, Col, Tabs} from 'antd'
const { TabPane } = Tabs
import ProcessGraph from './ProcessGraph'
import { Dialog } from 'nowrapper/lib/antd'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import renderModalForMutex from './renderModalForMutex'
import {
  ajax,
  formRule,
  listFormatBefore,
  listFormatAfter,
  processDefinitionPath,
  processFormTemplatePath,
  processInstanceDataPath,
  session,
  sysUserPath
} from '../../utils'
import { QueryCondition, Space, LoadingButton } from '../../components'
import OperateButton from './OperateButton'
import { useModel } from 'umi'
import Form1 from './Form1'
import Form2 from './Form2'
import Form3 from './Form3'
import ProcessFormForStart from './ProcessFormForStart'
import SelectUserGroup from './SelectUserGroup'

//这是form3的回调函数
let getForm3DataFunction

export default () => {

  const [list, setList] = useState()

  const buttonRender = (record) => {

    let arr = []
    //发起流程按钮
    const startProcessMap = session.getItem('startProcessButtonMap')
    const buttonItem = startProcessMap[record.id]
    if (buttonItem) {
      arr.push(<a onClick={() => onClick(record, buttonItem.permissionType)}>{buttonItem.name}</a>)
    }
    const buttonArr = session.getItem('dataListButtonMap')[processDefinitionPath.flag]
    if (buttonArr) {
      buttonArr.forEach(item => {
        arr.push(<a onClick={() => onClick(record, item.permissionType)}>{item.name}</a>)
      })
    }
    return arr
  }

  const onClick = async (record, type) => {
    if (type === 'startProcess') {
      //
      const userVL = await ajax.get(sysUserPath.getUserVL)
      const groupTree = await ajax.get(processFormTemplatePath.getFormTemplateGroupTreeForSelect, { processDefinitionId: record.id })
      //选择责任人和字段组
      let userType, userIdStr, userName, selectGroupIdArr
      Dialog.show({
        title: '表单选项',
        footerAlign: 'right',
        locale: 'zh',
        enableValidate: true,
        width: 450,
        content: <SelectUserGroup record={record} userVL={userVL} groupTree={groupTree} />,
        onOk: async (values, hide) => {
          //责任人
          userType = values.userType
          if (values.userType === '代其他人申请') {
            userName = values.userName
            if (values.userIdStr && values.userIdStr.indexOf(values.userName) > 0) {
              userIdStr = values.userIdStr
            }
          }
          //字段组
          const data = await ajax.get(processFormTemplatePath.getSelectGroupIdList, {
            processDefinitionId: record.id,
            checkGroupIdArr: values.checkGroupIdArr
          })
          if (data) {
            selectGroupIdArr = data
          }
          hide()
          //预加载数据,可以解决屏闪问题
          const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, { processDefinitionId: record.id })
          const tableTypeVO = await ajax.get(processFormTemplatePath.getTableTypeVO, { processDefinitionId: record.id })
          const startProcessConditionVO = await ajax.get(processInstanceDataPath.getStartProcessConditionVO, { processDefinitionId: record.id })
          Dialog.show({
            title: record.processName,
            footerAlign: 'right',
            locale: 'zh',
            enableValidate: true,
            width: '75%',
            content:  <Tabs animated={false}>
            <TabPane tab="表单" key="1">

            <ProcessFormForStart
            record={record}
            formTree={formTree}
            tableTypeVO={tableTypeVO}
            selectGroupIdArr={selectGroupIdArr}
            startProcessConditionVO={startProcessConditionVO} />
            </TabPane>
            <TabPane tab="流程图" key="2">
              <ProcessGraph id={record.id} />
            </TabPane>

          </Tabs>,
            footer: (hide, { _, ctx: core }) => {
              let onClick = async (buttonName) => {
                let errorArr = await core.validate()
                if (errorArr) {
                  Object.keys(errorArr).forEach(key => {
                    /*
                       key=16.计算机信息表.as_device_common.no.1
                       key=OperatorTypeLabel
                     */
                    if (key.split('.').length === 5 || key === 'OperatorTypeLabel') {
                      core.setValue(key + 'ErrMsg', errorArr[key])
                    }
                  })
                  message.error('请检查必填项')
                } else {
                  let values = core.getValues()
                  //表单的日期处理
                  values = formRule.dateHandle('stringify', values)
                  //表单的ErrMsg处理
                  values = formRule.errMsgHandle(values)
                  let startVO = {
                    buttonName: buttonName,
                    processDefinitionId: record.id,
                    value: null,
                    value2List: []
                  }
                  if (values.asset) {
                    startVO.value2List = values.asset
                  }
                  if (userType) {
                    startVO.userType = userType
                  }
                  if (userIdStr) {
                    startVO.userIdStr = userIdStr
                  }
                  if (userName) {
                    startVO.userName = userName
                  }
                  if (selectGroupIdArr && selectGroupIdArr.length > 0) {
                    startVO.selectGroupId = selectGroupIdArr.join(',')
                  }
                  //是否有下一步处理人
                  startVO.haveNextUser = startProcessConditionVO.haveNextUser
                  if (startProcessConditionVO.haveNextUser === '是') {
                    startVO.operatorType = values.operatorType
                    startVO.OperatorTypeValue = values.OperatorTypeValue
                    startVO.OperatorTypeLabel = values.OperatorTypeLabel
                    if (values.haveStarterDept) {
                      startVO.haveStarterDept = values.haveStarterDept
                      delete values.haveStarterDept
                    }
                    delete values.operatorType
                    delete values.OperatorTypeValue
                    delete values.OperatorTypeLabel
                  }
                  startVO.value = JSON.stringify(values)
                  console.log(startVO);
                  const data = await ajax.post(processInstanceDataPath.start, startVO)
                  if (data.isSuccess) {
                    //20211111再发ajax判断该资产对应的约束性流程是否还未走完
                    hide();
                    list.refresh();
                    message.success('发起成功');
                  } else {
                    Modal.error({
                      content: (
                        <div>
                          <Row>
                            <span style={{ fontWeight: 'bold' }}>
                              以下流程未处理完前，不可发起新流程：
                            </span>
                          </Row>
                          <Row>
                            <Col span={5}>流程编号</Col>
                            <Col span={8}>流程名称</Col>
                            <Col span={11}>当前步骤</Col>
                          </Row>
                          {renderModalForMutex(data.processInstanceDataList)}
                        </div>
                      ),
                      okText: '知道了',
                    });
                    console.log(data.processInstanceDataList);
                  }
                }
              }
              let btnArr = []
              if (startProcessConditionVO && startProcessConditionVO.buttonNameList) {
                startProcessConditionVO.buttonNameList.forEach(buttonName => {
                  btnArr.push(<LoadingButton onClick={() => {
                    onClick(buttonName)
                  }} type={'primary'}>{buttonName}</LoadingButton>)
                })
              } else {
                btnArr.push(<Button onClick={() => {
                  onClick(null)
                }} type={'primary'}>提交</Button>)
              }
              btnArr.push(<Button onClick={() => {
                hide()
              }}>取消</Button>)
              return <Space style={{ marginTop: 25, textAlign: 'center' }}>{btnArr}</Space>
            }
          })
        }
      })
    } 
  }

  const renderListButton = (text, record, idx) => {
    return <Space>
       <a onClick={() => onClick(record, 'startProcess')}>发起流程</a>
    
    </Space>
  }

  return <div>
    <List url={processDefinitionPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
      <Table>
        <Table.Column title="流程名称" dataIndex="processName" />
        <Table.Column title="资产分类" dataIndex="processType2" />
        <Table.Column title="事件分类" dataIndex="processType" />
        <Table.Column title="描述" dataIndex="description" />
        <Table.Column title="操作" render={renderListButton} />
      </Table>
      <Pagination showTotal={total => `共${total}条`} />
    </List>
  </div>
}
