import React, { useState } from 'react'
import { Button, message, Modal, Steps, Row, Col, Tabs } from 'antd'

const { TabPane } = Tabs
import { Dialog } from 'nowrapper/lib/antd'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import ProcessGraph from './ProcessGraph'
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
  sysUserPath,
  formItemValidate
} from '../../utils'
import { QueryCondition, Space, LoadingButton } from '../../components'
import OperateButton from './OperateButton'
import { useModel } from 'umi'
import Form1 from './Form1'
import Form2 from './Form2'
import Form3 from './Form3'
import ProcessFormForStart from './ProcessFormForStart'
import SelectUserGroup from './SelectUserGroup'

/* 张：这是form3的回调函数
我：这个说法容易混乱。实际是“利用传父函数的指针传给子函数
来（在父函数体内有<用于接收子函数指针变量>获取子函数指针 */
let getForm3DataFunction

export default () => {
  const { current, setCurrent, modalVisit, setModalVisit, title, setTitle, form1Core, map, setMap, setForm1Data, setForm3Data, type, setType } = useModel('useProcessDefinition')
  const [list, setList] = useState()
  const [confirmLoading, setConfirmLoading] = useState(false)


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
      const groupTree = await ajax.get(processFormTemplatePath.getFormTemplateGroupTree, { processDefinitionId: record.id })
      //选择责任人和字段组
      if (userVL && groupTree) {
        let committerType, committerIdStr, committerName, selectGroupIdArr
        Dialog.show({
          title: '表单选项',
          footerAlign: 'right',
          locale: 'zh',
          enableValidate: true,
          width: 450,
          content: <SelectUserGroup record={record} userVL={userVL} groupTree={groupTree} />,
          onOk: async (values, hide) => {
            //责任人
            committerType = values.committerType
            if (values.committerType === '代其他人申请') {
              committerName = values.committerName
              if (values.committerIdStr && values.committerIdStr.indexOf(values.committerName) > 0) {
                committerIdStr = values.committerIdStr
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

            //20211206  获取template Label/id的映射；接收前端成为一个对象：属性名是label值，值为ID
            const templateIdLableMap = await ajax.get(processFormTemplatePath.getFormTemplateIdLableMap, {
              processDefinitionId: record.id,
            });
            Dialog.show({
              title: record.processName,
              footerAlign: 'right',
              locale: 'zh',
              enableValidate: true,
              width: '75%',
              content:
                <Tabs animated={false}>
                  <TabPane tab="表单" key="1">
                    <ProcessFormForStart
                      //20211211
                      userInfo={values}
                      templateIdLableMap={templateIdLableMap}
                      record={record}
                      formTree={formTree}
                      tableTypeVO={tableTypeVO}
                      selectGroupIdArr={selectGroupIdArr}
                      startProcessConditionVO={startProcessConditionVO} />
                  </TabPane>
                  <TabPane tab="流程图" key="2">
                    <ProcessGraph id={record.id} />
                  </TabPane>
                </Tabs>
              ,
              //20211124 footer的render方法,在这里还定义了一个内嵌函数，供提交button调用
              footer: (hide, { _, ctx: core }) => {
                let onClick = async (buttonName) => {
                  let errorArr = await core.validate()
                  if (errorArr) {
                    Object.keys(errorArr).forEach(key => {
                      /*
                         key=16.计算机信息表.as_device_common.no.1
                         key=operatorTypeLabel
                       */
                      if (key.split('.').length === 5 || key === 'operatorTypeLabel') {
                        core.setValue(key + 'ErrMsg', errorArr[key])
                      }
                    })
                    message.error('请检查必填项')
                  } else {
                    let values = core.getValues();
                    //表单的日期处理
                    values = formRule.dateHandle('stringify', values);
                    //表单的ErrMsg处理
                    values = formRule.errMsgHandle(values);
                    //20211206 todo添加表单校验,思考表单template结构数据data4定义在ProcessFormForStart，如何共用？
                    const msg = formItemValidate(templateIdLableMap, values)
                    if (msg) {
                      Modal.error({
                        title: '提示',
                        content: <div> {msg}</div>,
                      });

                      return
                    }
                    let startVO = {
                      buttonName: buttonName,
                      value: null,
                      value1: { processDefinitionId: record.id },//20220531,todo问，感觉不能动态在后面添加成员
                      value2List: [],
                    };
                    if (values.diskListForHisForProcess) {//20220619加
                      startVO.diskListForHisForProcess= values.diskListForHisForProcess;
                     delete values.diskListForHisForProcess; 
                    }
                    if (values.asset) {
                      startVO.value2List = values.asset;
                      //20220601可能需要delete asset
                      delete values.asset;
                    }
                    if (committerType) {
                      startVO.value1.committerType = committerType;
                    }
                    if (committerIdStr) {
                      startVO.value1.committerIdStr = committerIdStr;
                    }
                    if (committerName) {//20211203 本人提交时不走这里
                      //alert(committerName)

                      startVO.value1.committerName = committerName;
                    }
                    if (selectGroupIdArr && selectGroupIdArr.length > 0) {
                      startVO.value1.selectGroupId = selectGroupIdArr.join(',');
                    }
                    //是否有下一步处理人
                    startVO.haveNextUser = startProcessConditionVO.haveNextUser;
                    if (startProcessConditionVO.haveNextUser === '是') {
                      startVO.operatorType = values.operatorType;
                      startVO.operatorTypeValue = values.operatorTypeValue;
                      startVO.operatorTypeLabel = values.operatorTypeLabel;
                      if (values.haveStarterDept) {
                        startVO.haveStarterDept = values.haveStarterDept;
                        delete values.haveStarterDept;
                      }
                      delete values.operatorType;
                      delete values.operatorTypeValue;
                      delete values.operatorTypeLabel;
                    }
                    //20220510注意：这里把组件的值拼成json字符串了（当然，除了这个jsion串格式的Value外，组件的值也照样传了）：对应着（要保存到）value1表的value字段
                    startVO.value1.value = JSON.stringify(values);//20220415 表单里的值组成的是一个json对象？还是普通JS对象?后者，并且js中json对象也是js对象的一种;
                    const data = await ajax.post(processInstanceDataPath.start, startVO)
                    if (data) {//20211220加超时判断：超时会返回空
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
                    } else {
                      message.success('发起失败');
                    }
                  }
                }
                let btnArr = []
                if (startProcessConditionVO && startProcessConditionVO.buttonNameList) {
                  startProcessConditionVO.buttonNameList.forEach(buttonName => {
                    btnArr.push(
                      <LoadingButton
                        onClick={onClick}
                        param={buttonName}
                        type={'primary'}>{buttonName}
                      </LoadingButton>)
                  })
                } else {//20211220 为何在后台有断点时，没有loading效果:按张强说的“props格式”改造就行了
                  // btnArr.push(<LoadingButton onClick={() => {
                  //   onClick(null)}
                  btnArr.push(<LoadingButton onClick={
                    onClick
                  } param={null} type={'primary'}>提交333</LoadingButton>)
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
    } else if (type === 'edit') {
      //获取form1、form2、form3的数据
      const data = await ajax.get(processDefinitionPath.getProcessDefinitionVO, { processDefinitionId: record.id })
     console.log('form edit-------')
     console.log(data)
     
      if (data) {
        //form1
        setForm1Data(data.processDefinition)
        //form2
        let initMap = new Map()
        initMap.set('group', [])

        let count = 10//20220428？？？？
        //20220428后台传过来的map格式的data.formTemplateMap到前台已经成了对象格式，所以需要重新组装成js/map
        Object.keys(data.formTemplateMap).forEach((key) => {
          let tmp = []
          data.formTemplateMap[key].forEach(item => {
            item.index = count
            count++
            tmp.push(item)
          })
          initMap.set(key, tmp)
        })

        initMap.set('index', count)
        console.log(initMap)
        setMap(initMap)
        //form3
        setForm3Data({
          bpmnXml: data.processDefinition.bpmnXml,
          nodeList: data.taskList,
          edgeList: data.edgeList
        })
        setType('edit')
        setTitle('修改流程')
        //20220526因为modal一直存在，所以每次显示式就把他的“转动状态”关闭了
        setConfirmLoading(false)
        setModalVisit(true)

      }
    } else if (type === 'copy') {
      Dialog.show({
        title: '提示',
        footerAlign: 'right',
        locale: 'zh',
        width: 400,
        content: <p style={{ fontSize: 15 }}>确定要复制<span style={{ color: 'red' }}>{record.processName}</span></p>,
        onOk: async (values, hide) => {
          const data = await ajax.get(processDefinitionPath.copy, { processDefinitionId: record.id })
          if (data) {
            hide()
            list.refresh()
            message.success('复制成功')
          }
        }
      })
    } else if (type === 'delete') {
      Dialog.show({
        title: '提示',
        footerAlign: 'right',
        locale: 'zh',
        width: 400,
        content: <p style={{ fontSize: 15 }}>确定要删除<span style={{ color: 'red' }}>{record.processName}</span></p>,
        onOk: async (values, hide) => {
          const data = await ajax.get(processDefinitionPath.delete, { processDefinitionId: record.id })
          if (data) {
            hide()
            list.refresh()
            message.success('删除成功')
          }
        }
      })
    }
  }

  const renderListButton = (text, record, idx) => {
    return <Space>
      {/*      <a onClick={() => onClick(record, 'startProcess')}>发起流程</a>
      <a onClick={() => onClick(record, 'edit')}>修改</a>
      <a onClick={() => onClick(record, 'copy')}>复制</a>
      <a onClick={() => onClick(record, 'delete')}>删除</a>*/}
      {buttonRender(record)}
    </Space>
  }

  return <div>
    <List url={processDefinitionPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
      <QueryCondition path={processDefinitionPath} list={list} />
      <OperateButton path={processDefinitionPath} />
      <Table>
        <Table.Column title="流程名称" dataIndex="processName" />
        <Table.Column title="资产分类" dataIndex="processType2" />
        <Table.Column title="事件分类" dataIndex="processType" />
        <Table.Column title="描述" dataIndex="description" />
        <Table.Column title="操作" render={renderListButton} />
      </Table>
      <Pagination showTotal={total => `共${total}条`} />
    </List>
    {/* 这个modal的角色相当于"标准化"CRUD组件套装里的Form.jsx，只是后者是通过dialog包装，所以不像前者写操作是在本身组件内 */}
    <Modal
      title={title}
      visible={modalVisit}
      style={{ top: 0 }}
      width={'100%'}
      confirmLoading={confirmLoading}
      okText={'保存流程定义'}
      onOk={async () => {
        let data = { processDefinition: {}, formTemplateList: [], taskList: [], edgeList: [] }
        //表单1
        const errorArr = await form1Core.validate()
        if (errorArr) {
          message.error('基本信息不能为空')
          return
        }
        data.processDefinition = form1Core.getValues()
        //表单2
        map.forEach((value, key, mapp) => {
          if (key === 'firstData') {
            data.formTemplateList = data.formTemplateList.concat(value)
          } else if (key !== 'index' || key !== 'group') {//这个是情况下是对字段组成员的遍历，而字段组（含内嵌式）本自这个对象的信息是放在firstData中
            if (value.length > 0) {
              let tmp = []
              value.forEach(item => {
                item.groupParentLabel = key
                tmp.push(item)
              })
              data.formTemplateList = data.formTemplateList.concat(tmp)
            }
          }
        })
        if (data.formTemplateList.length === 0) {
          message.error('配置表单不能为空')
          return
        }
        //表单3
        let form3Data = getForm3DataFunction()
        if (!form3Data) return
        //20220603把loading状态设置从函数开始下移至此：前端非ajax相关校验没必要用这个&用了反而不便
        setConfirmLoading(true)
        data.processDefinition.bpmnXml = form3Data.bpmnXml
        data.taskList = form3Data.nodeList
        data.edgeList = form3Data.edgeList
        const dataa = await ajax.post(data.processDefinition.id ? processDefinitionPath.edit : processDefinitionPath.add, data)
        if (dataa) {
          //刷新
          list.refresh()
          //清空表单1、表单2、表单3
          form1Core.reset()
          let initMap = new Map()
          initMap.set('firstData', [])
          initMap.set('index', 1)
          initMap.set('group', [])
          setMap(initMap)
          setForm3Data(null)

          setType('add')
          setCurrent(0)
          setModalVisit(false)
          message.success('保存成功')
        }
        setConfirmLoading(false)
      }}
      onCancel={() => {
        //清空表单2
        let initMap = new Map()
        initMap.set('firstData', [])
        initMap.set('index', 1)
        initMap.set('group', [])
        setMap(initMap)

        setType('add')
        setCurrent(0)
        setModalVisit(false)
      }}
      keyboard={false}
    >
      <Steps current={current} onChange={current => setCurrent(current)}>
        <Steps.Step title="基本信息" />
        <Steps.Step title="配置表单" />
        <Steps.Step title="设计流程" />
      </Steps>
      <div style={{ marginTop: 20, display: current === 0 ? 'block' : 'none' }}><Form1 /></div>
      <div style={{ marginTop: 20, display: current === 1 ? 'block' : 'none' }}><Form2 /></div>
      <div style={{ marginTop: 20, display: current === 2 ? 'block' : 'none' }}>
        <Form3
          get={(func) => {
            getForm3DataFunction = func
          }}
        />
      </div>
    </Modal>
  </div>
}
