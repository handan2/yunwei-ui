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
} from '../../utils'
import { QueryCondition, Space, LoadingButton } from '../../components'
import OperateButton from './OperateButton'
import { useModel } from 'umi'
import Form1 from './Form1'
import Form2 from './Form2'
import Form3 from './Form3'
import ProcessFormForStart from './ProcessFormForStart'
import SelectOptionForm from './SelectOptionForm'
import { onClickForStart } from '../ProcessInstanceData/onClick';

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
      onClickForStart(record,'start')
  
    } else if (type === 'edit') {
      //获取form1、form2、form3的数据
      const data = await ajax.get(processDefinitionPath.getProcessDefinitionVO, { processDefinitionId: record.id })
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
        <Table.Column title="事件分类" dataIndex="processType" />
        <Table.Column title="事件分类2" dataIndex="processType2" />
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
