import { h, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class ApprovalTaskModel extends RectNodeModel {
  static extendKey = 'ApprovalTaskModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Task_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class ApprovalTaskView extends RectNode {
  static extendKey = 'ApprovalTaskNode';
  getLabelShape() {
    const attributes = super.getAttributes();
    const { x, y, width, height, stroke } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 50,
        height: 24,
        viewBox: '0 0 1274 1024',
      },
      h('path', {
        fill: stroke,
        d:
          'M811.689968 869.842016m22.715603-18.838774l-0.047822 0.039661q22.715603-18.838774 41.554377 3.876829l92.09186 111.043433q18.838774 22.715603-3.876829 41.554378l0.047822-0.039661q-22.715603 18.838774-41.554377-3.876829l-92.09186-111.043433q-18.838774-22.715603 3.876829-41.554378ZM495.877685 0C329.808518 0 194.120131 126.866157 194.120131 288.710593c0 109.345953 65.6697 205.520689 157.49545 253.545929C159.141852 599.166121 14.879748 774.119646 14.879748 979.640335c0 13.04696 13.109089 26.093921 30.691421 26.093921s30.505036-13.109089 30.505035-26.156049c0-223.103021 188.000485-406.568135 419.801481-406.568135h8.760102c161.533794-4.411115 292.935323-131.339401 292.935323-288.648465S662.008979 0 495.877685 0z m0 520.325203c-135.564131 0-244.785827-104.996966-244.785827-231.738866S360.251426 57.033855 495.815556 57.033855s244.847955 104.87271 244.847956 231.738867-109.283825 231.676738-244.785827 231.676738zM877.905109 606.621527a184.148526 184.148526 0 1 0 53.989564 130.469603 183.092343 183.092343 0 0 0-53.989564-130.469603z m-130.469604 274.545322a144.324232 144.324232 0 1 1 144.324233-144.324233 144.448489 144.448489 0 0 1-144.324233 144.386361z',
      }),
    );
  }
  getShape() {
    const attributes = super.getAttributes();
    const {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      radius,
    } = attributes;
    // todo: 将basic-shape对外暴露，在这里可以直接用。现在纯手写有点麻烦。
    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        fill,
        stroke,
        strokeWidth,
        width,
        height,
      }),
      this.getLabelShape(),
    ]);
  }
}

const ApprovalTask = {
  type: 'bpmn:approvalTask',
  view: ApprovalTaskView,
  model: ApprovalTaskModel,
};

export { ApprovalTaskView, ApprovalTaskModel };
export default ApprovalTask;
