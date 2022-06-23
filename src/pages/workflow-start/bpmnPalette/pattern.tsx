import React, {ReactElement} from 'react';
import LogicFlow from '@logicflow/core';

type IProps = {
  lf: LogicFlow
}

export default function BpmnPattern(props: IProps): ReactElement {
  const {lf} = props;

  function addStartNode() {
    lf.dnd.startDrag({
      type: 'bpmn:startEvent',
      text: '开始'
    });
  }

  function addUserTask() {
    lf.dnd.startDrag({
      type: 'bpmn:userTask'
    });
  }

  function addServiceTask() {
    lf.dnd.startDrag({
      type: 'bpmn:serviceTask',
    });
  }

  function addExclusiveGateway() {
    lf.dnd.startDrag({
      type: 'bpmn:exclusiveGateway',
    });
  }

  function addParallelGateway() {
    lf.dnd.startDrag({
      type: 'bpmn:parallelGateway',
    });
  }

  function addEndNode() {
    lf.dnd.startDrag({
      type: 'bpmn:endEvent',
      text: '结束'
    });
  }

  function deleteElement() {
    const elements = lf.graphModel.getSelectElements()
    lf.clearSelectElements()
    if (elements) {
      elements.edges.forEach(edge => lf.deleteEdge(edge.id))
      elements.nodes.forEach(node => lf.deleteNode(node.id))
    }
    return false
  }

  function openSelection() {
    lf.updateEditConfig({
      stopMoveGraph: true,
    });
  }

  lf && lf.on('selection:selected', () => {
    lf.updateEditConfig({
      stopMoveGraph: false,
    });
  });
  return (
    <div className="pattern">
      <div className="pattern-selection" onMouseDown={() => openSelection()}/>
      <div>选区</div>
      <div className="pattern-start" onMouseDown={() => addStartNode()}/>
      <div>开始</div>
      <div className="pattern-user" onMouseDown={() => addUserTask()}></div>
      <div>审批任务</div>
      <div className="pattern-service" onMouseDown={() => addServiceTask()}></div>
      <div>处理任务</div>
      <div className="pattern-exclusive" onMouseDown={() => addExclusiveGateway()}></div>
      <div>条件判断</div>
      <div className="pattern-parallel" onMouseDown={() => addParallelGateway()}></div>
      <div>并行网关</div>
      <div className="pattern-end" onMouseDown={() => addEndNode()}></div>
      <div>结束</div>
      {/*<div className="delete-element" onMouseDown={() => deleteElement()}></div>*/}
      {/*<div>删除</div>*/}
    </div>
  );
}
