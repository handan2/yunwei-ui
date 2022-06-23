import { h, PolygonNode, PolygonNodeModel,BaseNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';
type PointTuple = [number, number];

export type ExclusiveGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[] & string;
};

class ExclusiveGatewayModel extends PolygonNodeModel {
  static extendKey = 'ExclusiveGatewayModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `ExclusiveGateway_${getBpmnId()}`;
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

class ExclusiveGatewayView extends PolygonNode {
  static extendKey = 'ExclusiveGatewayNode';
  getLabelShape() {
    const attributes = this.getAttributes();
    const { x, y, width, height } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2+5,
        y: y - height / 2,
        width: 50,
        height: 50,
        viewBox: '0 0 1274 1024'
      },
      h('path', {
        fill: '#1890ff',
        d:
          'M745.386667 233.386667l45.226666 45.226666L557.226667 512l233.386666 233.386667-45.226666 45.226666L512 557.226667l-233.386667 233.386666-45.226666-45.226666L466.773333 512 233.386667 278.613333l45.226666-45.226666L512 466.773333l233.386667-233.386666z'
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

const ExclusiveGateway = {
  type: 'bpmn:exclusiveGateway',
  view: ExclusiveGatewayView,
  model: ExclusiveGatewayModel,
};

export { ExclusiveGatewayView, ExclusiveGatewayModel };
export default ExclusiveGateway;
