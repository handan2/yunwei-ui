import { CircleNode, CircleNodeModel, h } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class EndEventModel extends CircleNodeModel {
  static extendKey = 'EndEventModel';

  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Event_${getBpmnId()}`;
    }
    data.text = '';
    super(data, graphModel);
  }

  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules();
    const notAsSource = {
      message: '结束节点不能作为连线的起点',
      validate: () => false
    };
    rules.push(notAsSource);
    return rules;
  }
}

class EndEventView extends CircleNode {
  getAttributes() {
    let attr = super.getAttributes();
    attr.stroke = '#FF0040';
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
        x: x - width / 2 + 10,
        y: y - height / 2 + 8,
        width: 20,
        height: 20,
        viewBox: '0 0 1274 1024'
      },
      h('path', {
        fill: '#d81e06',
        d:
          'M1024 127.937531v767.625183c0 70.665495-57.272035 127.937531-127.937531 127.93753h-767.625183c-70.665495 0-127.937531-57.272035-127.93753-127.93753v-767.625183c0-70.665495 57.272035-127.937531 127.93753-127.937531h767.625183c70.665495 0 127.937531 57.272035 127.937531 127.937531z'
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

const EndEvent = {
  type: 'bpmn:endEvent',
  view: EndEventView,
  model: EndEventModel
};

export { EndEventView, EndEventModel };
export default EndEvent;
