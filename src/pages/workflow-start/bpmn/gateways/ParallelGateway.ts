import { h, PolygonNode, PolygonNodeModel,BaseNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';
type PointTuple = [number, number];

export type ParallelGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[] & string;
};

class ParallelGatewayModel extends PolygonNodeModel {
  static extendKey = 'ParallelGatewayModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Gateway_${getBpmnId()}`;
    }
    if (!data.text) {
      data.text = '';
    }
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y + 40,
      };
    }
    super(data, graphModel);
    this.points = [
      [25, 0],
      [50, 25],
      [25, 50],
      [0, 25],
    ];
  }
}

class ParallelGatewayView extends PolygonNode {
  static extendKey = 'ParallelGatewayNode';
  getShape() {
    const attributes = super.getAttributes() as ParallelGatewayAttribute;
    const {
      x,
      y,
      fill,
      stroke,
      strokeWidth,
      width,
      height,
      points,
    } = attributes;
    return h(
      'g',
      {
        transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
      },
      h('polygon', {
        fill:'yellow',
        x,
        y,
        stroke,
        strokeWidth,
        points,
      }),
      h('path', {
        fill:'blue',
        stroke,
        strokeWidth,
        d:
          'm 23,10 0,12.5 -12.5,0 0,5 12.5,0 0,12.5 5,0 0,-12.5 12.5,0 0,-5 -12.5,0 0,-12.5 -5,0 z',
      }),
    );
  }
}

const ParallelGateway = {
  type: 'bpmn:parallelGateway',
  view: ParallelGatewayView,
  model: ParallelGatewayModel,
};

export { ParallelGatewayView, ParallelGatewayModel };
export default ParallelGateway;
