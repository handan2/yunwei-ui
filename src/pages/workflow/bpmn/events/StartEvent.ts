import { CircleNode, CircleNodeModel, h } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class StartEventModel extends CircleNodeModel {
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Event_${getBpmnId()}`;
    }
    data.text = '';
    super(data, graphModel);
  }

  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules();
    const notAsTarget = {
      message: '起始节点不能作为连线的终点',
      validate: () => false
    };
    rules.push(notAsTarget);
    return rules;
  }
}

class StartEventView extends CircleNode {
  static extendKey = 'StartEventNode';

  getAttributes() {
    let attr = super.getAttributes();
    attr.fill = '#1afa29';
    attr.stroke = '#1afa29';
    return {
      ...attr
    };
  }

  getLabelShape() {
    const attributes = this.getAttributes();
    const { x, y, width, height } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 7,
        y: y - height / 2 + 5,
        width: 26,
        height: 26,
        viewBox: '0 0 1024 1024'
      },
      h('path', {
        fill: '#FFFFFF',
        d:
          'M204.672 204.8l0.576-9.024a76.8 76.8 0 0 1 114.624-57.472l2.688 1.6 464.64 309.888a78.08 78.08 0 0 1-1.472 126.72l-462.08 306.816c-12.224 8.448-26.88 13.184-42.176 12.608-42.24-1.536-76.8-34.56-76.8-76.8V204.8z'
      })
    );
  }

  getShape() {
    return h('g', {}, [
      super.getShape(),
      this.getLabelShape()
    ]);
  }
}

const StartEvent = {
  type: 'bpmn:startEvent',
  view: StartEventView,
  model: StartEventModel
};

export { StartEventModel, StartEventView };
export default StartEvent;
