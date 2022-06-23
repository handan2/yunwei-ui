// import LogicFlow from '@logicflow/core';
import StartEvent from './events/StartEvent';
import EndEvent from './events/EndEvent';
import ExclusiveGateway from './gateways/ExclusiveGateway';
import ParallelGateway from './gateways/ParallelGateway';
import StartTask from './tasks/StartTask';
import ApprovalTask from './tasks/ApprovalTask';
import HandleTask from './tasks/HandleTask';
import ArchiveTask from './tasks/ArchiveTask';
import SequenceFlow from './flow/SequenceFlow';
import { theme } from './constant';

// todo: name
class BpmnElement {
  constructor({ lf }) {
    lf.setTheme(theme);
    lf.register(StartEvent);
    lf.register(EndEvent);
    lf.register(ExclusiveGateway);
    lf.register(ParallelGateway);
    lf.register(StartTask);
    lf.register(ApprovalTask);
    lf.register(HandleTask);
    lf.register(ArchiveTask);
    lf.register(SequenceFlow);
    lf.setDefaultEdgeType('bpmn:sequenceFlow');
  }
}

export {
  BpmnElement,
};
