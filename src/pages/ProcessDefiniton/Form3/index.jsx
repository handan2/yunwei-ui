import React, { useEffect } from 'react'
import { Button, message } from 'antd'
//原生组件
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import { DndPanel, SelectionSelect } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
//改造组件
import { BpmnXmlAdapter } from '../../workflow/bpmn-adapter'
import { BpmnElement } from '../../workflow/bpmn'
import BpmnPattern from '../../workflow/bpmnPalette/pattern'
import '../../workflow/bpmnPalette/index.css'
//
import { useModel } from 'umi'
import { Dialog } from 'nowrapper/lib/antd'
import NodeForm from './NodeForm'
import EdgeForm from './EdgeForm'

let nodeMap
let edgeMap
let lf

export default (props) => {
  const { current, setCurrent, map, type, form3Data } = useModel('useProcessDefinition')
  console.log('form3/index---------')
  console.log(map)
  useEffect(async () => {
    LogicFlow.use(DndPanel)
    LogicFlow.use(SelectionSelect)
    LogicFlow.use(BpmnXmlAdapter)
    LogicFlow.use(BpmnElement)
    lf = new LogicFlow({
      container: document.querySelector('#graph'),
      stopScrollGraph: true,
      stopZoomGraph: true,
      nodeTextEdit: false,
      edgeTextEdit: false,
      nodeTextDraggable: true,
      edgeTextDraggable: true,
      keyboard: {
        enabled: true,
        shortcuts: {
          keys: ['delete'],
          callback: () => {
            const elements = lf.graphModel.getSelectElements()
            lf.clearSelectElements()
            if (elements) {
              elements.edges.forEach(edge => {
                lf.deleteEdge(edge.id)
                edgeMap.delete(edge.id)
              })
              elements.nodes.forEach(node => {
                lf.deleteNode(node.id)
                nodeMap.delete(node.id)
              })
            }
          }
        }
      },
      width: '100%',
      height: document.documentElement.clientHeight - 250,
      grid: {
        type: 'dot',
        size: 20
      }
    })
    lf.on('node:dbclick', ({ data: node }) => {
      if (node.type === 'bpmn:startTask' || node.type === 'bpmn:approvalTask' || node.type === 'bpmn:handleTask' || node.type === 'bpmn:archiveTask') {
        Dialog.show({
          title: '任务属性',
          footerAlign: 'label',
          locale: 'zh',
          enableValidate: true,
          width: 600,
          //20220605 node是从bpmn读出来的，data/map是从task表中读出来的
          content: <NodeForm node={node} data={nodeMap.get(node.id)} map={map} />,
          onOk: (values, hide) => {
            if (!values.taskName) {
              message.error('任务名称不能为空')
              return
            }
            if (!values.operatorTypeLabel) {
              message.error('处理人不能为空')
              return
            }
            //存储
            console.log('20220626 nodeForm values')
            console.log(values)
            nodeMap.set(node.id, values)
            //设置节点名称
            lf.updateText(node.id, values.taskName)
            hide()
          }
        })
      }
    })
    lf.on('edge:dbclick', ({ data: edge }) => {
      //连线的开始不能是开始事件和并行网关
      if (edge.sourceNodeId.indexOf('Event') < 0 && edge.sourceNodeId.indexOf('ParallelGateway') < 0) {
        Dialog.show({
          title: '连线属性',
          footerAlign: 'label',
          locale: 'zh',
          enableValidate: true,
          width: 500,
          content: <EdgeForm edge={edge} data={edgeMap.get(edge.id)} map={map}  />,
          onOk: (values, hide) => {
            //存储
            edgeMap.set(edge.id, values)
            //设置节点名称
            lf.updateText(edge.id, values.edgeName)
            hide()
          }
        })
      }
    })

    nodeMap = new Map()
    edgeMap = new Map()
    if (type === 'add') {
      lf.render()
    } else {
      if (form3Data) {
        form3Data.nodeList.forEach(node => {
          nodeMap.set(node.taskDefKey, node)
        })
        form3Data.edgeList.forEach(edge => {
          edgeMap.set(edge.edgeId, edge)
        })
        lf.render(form3Data.bpmnXml)
      }
    }
    //传递给父组件
    props.get(getForm3Data)
  }, [type,map])

  const validateEdge = (node) => {
    let flag = true
    //节点的向外连线
    const edges = lf.getEdge({ sourceNodeId: node.id })
    let arr = []
    if (edges.length > 1) {
      //遍历
      edges.forEach(edge => {
        let edge2 = edgeMap.get(edge.id)
        if (edge2) {
          arr.push(edge2)
        }
      })
      //判断
      if (edges.length !== arr.length) {
        flag = false
        if (node.type === 'bpmn:exclusiveGateway') {
          message.error('条件判断不能为空')
          return
        } else {
          let node2 = nodeMap.get(node.id)
          if (node2) {
            message.error(node2.taskName + '的连线名称不能为空')
          } else {
            message.error('任务名称不能为空')
          }
        }
      }
    }
    return flag
  }

  const getForm3Data = () => {
    let form3Data = { bpmnXml: null, nodeList: [], edgeList: [] }
    //bpmnXml
    form3Data.bpmnXml = lf.getGraphData()
    //从bpmnRawData中获取node和edge
    const { nodes, edges } = lf.getGraphRawData()
    if (nodes.length === 0) {
      message.error('没有流程图')
      return
    }
    let flag = true

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i]
      if (node.type === 'bpmn:startTask' || node.type === 'bpmn:approvalTask' || node.type === 'bpmn:handleTask' || node.type === 'bpmn:archiveTask') {
        if (validateEdge(node)) {
          let node2 = nodeMap.get(node.id)
          if (node2) {
            form3Data.nodeList.push(node2)
          } else {//找不到节点为何会报任务名称为空？张：随便起的
            flag = false
            message.error('任务名称不能为空')
            break
          }
        } else {
          //校验失败
          flag = false
          break
        }
      } else if (node.type === 'bpmn:exclusiveGateway') {
        if (validateEdge(node)) {
          //校验成功
          form3Data.nodeList.push({ taskType: node.type, taskDefKey: node.id })
        } else {
          //校验失败
          flag = false
          break
        }
      } else {
        //开始事件，结束事件，并行网关
        form3Data.nodeList.push({ taskType: node.type, taskDefKey: node.id })
      }
    }
    if (!flag) return
    //edge
    edges.forEach(edge => {
      let edge2 = edgeMap.get(edge.id)
      if (edge2) {
        form3Data.edgeList.push(edge2)
      } else {
        form3Data.edgeList.push({ edgeId: edge.id, sourceId: edge.sourceNodeId, targetId: edge.targetNodeId })
      }
    })
    // console.log(form3Data);
    return form3Data
  }

  return <div>
    <div style={{ marginBottom: 5 }}>
      <Button
        onClick={() => {
          setCurrent(current - 1)
        }} type={'primary'}>上一步</Button>
    </div>
    <div className="bpmn-example-container">
      <div id="graph" className="viewport" />
      <BpmnPattern lf={lf} />
    </div>
  </div>
}
