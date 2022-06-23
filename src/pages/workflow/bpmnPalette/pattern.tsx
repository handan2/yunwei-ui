import React, { ReactElement } from 'react';
import LogicFlow from '@logicflow/core';

type IProps = {
  lf: LogicFlow
}

export default function BpmnPattern(props: IProps): ReactElement {
  const { lf } = props;

  function addStartNode() {
    lf.dnd.startDrag({
      type: 'bpmn:startEvent',
      text: '开始'
    });
  }

  function addStartTask() {
    lf.dnd.startDrag({
      type: 'bpmn:startTask'
    });
  }

  function addApprovalTask() {
    lf.dnd.startDrag({
      type: 'bpmn:approvalTask'
    });
  }

  function addHandleTask() {
    lf.dnd.startDrag({
      type: 'bpmn:handleTask'
    });
  }

  function addArchiveTask() {
    lf.dnd.startDrag({
      type: 'bpmn:archiveTask'
    });
  }

  function addExclusiveGateway() {
    lf.dnd.startDrag({
      type: 'bpmn:exclusiveGateway'
    });
  }

  function addParallelGateway() {
    lf.dnd.startDrag({
      type: 'bpmn:parallelGateway'
    });
  }

  function addEndNode() {
    lf.dnd.startDrag({
      type: 'bpmn:endEvent',
      text: '结束'
    });
  }

  function openSelection() {
    lf.updateEditConfig({
      stopMoveGraph: true
    });
  }

  lf && lf.on('selection:selected', () => {
    lf.updateEditConfig({
      stopMoveGraph: false
    });
  });
  return (
    <div className={"shadow"}>
      <div className="pattern">
        <div className="pattern-selection" onMouseDown={() => openSelection()}/>
        <div>选区</div>
        <div className="pattern-start" onMouseDown={() => addStartNode()}/>
        <div>开始</div>
        <div className="pattern-exclusive" onMouseDown={() => addExclusiveGateway()}></div>
        <div>条件判断</div>
        <div className="pattern-parallel" onMouseDown={() => addParallelGateway()}></div>
        <div>并行网关</div>
        <div className="pattern-end" onMouseDown={() => addEndNode()}></div>
        <div>结束</div>
      </div>
      <div className="pattern2">
        <div style={{visibility:'hidden',height:54}}></div>
        <div className="pattern-start-task" onMouseDown={() => addStartTask()}></div>
        <div>发起任务</div>
        <div className="pattern-approval" onMouseDown={() => addApprovalTask()}></div>
        <div>审批任务</div>
        <div className="pattern-handle" onMouseDown={() => addHandleTask()}></div>
        <div>处理任务</div>
        <div className="pattern-archive" onMouseDown={() => addArchiveTask()}></div>
        <div>归档任务</div>
      </div>
    </div>
  );
}
