import React, { useEffect } from 'react'
//原生组件
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import { SelectionSelect } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
//改造组件
import { BpmnXmlAdapter } from '../workflow/bpmn-adapter'
import { BpmnElement } from '../workflow/bpmn'
import '../workflow/bpmnPalette/index.css'
//
import { ajax, processDefinitionPath, processInstanceDataPath } from '../../utils'

export default (props) => {
  const { record: processInstanceData } = props
  useEffect(async () => {
//20211126为了兼容从流程实例发起中的多标签页调这个流程图，做了兼容
    const data = await ajax.get(processDefinitionPath.get, processInstanceData ? { processDefinitionId: processInstanceData.processDefinitionId } : { processDefinitionId: props.id })
    let data2 
    if (processInstanceData) {
      data2 = await ajax.get(processInstanceDataPath.getActiveTaskDefKeyList, { actProcessInstanceId: processInstanceData.actProcessInstanceId })
    }
     if (data) {
   // if (data &&  data2 ) {//20211130
      LogicFlow.use(SelectionSelect)
      LogicFlow.use(BpmnXmlAdapter)
      LogicFlow.use(BpmnElement)
      const lf = new LogicFlow({
        container: document.querySelector('#graph'),
        stopScrollGraph: true,
        stopZoomGraph: true,
        nodeTextEdit: false,
        edgeTextEdit: false,
        nodeTextDraggable: false,
        edgeTextDraggable: false,
        width: '100%',
        height: document.documentElement.clientHeight - 250,
        grid: {
          type: 'dot',
          size: 20
        },
        isSilentMode: true // 开启静默模式
      })
      lf.render(data.bpmnXml)
      //流程状态
    
      if (processInstanceData && processInstanceData?.processStatus !== '完成') {
       
       data2.forEach(nodeId => lf.getNodeModel(nodeId).updateAttributes({ fill: 'yellow', isSelected: true }))
     }
     //20211130张强：如果不能渲染流程图，可考虑加一个useState:setLoading(false)
    }
  }, [props])
//同上!loading && <div className="bpmn-example-container">
  return <div className="bpmn-example-container">
    <div id="graph" className="viewport" style={{ textAlign: 'center' }} />
  </div>

}
