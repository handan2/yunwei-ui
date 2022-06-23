import { h, PolygonNode, PolygonNodeModel, BaseNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

type PointTuple = [number, number];

export type ParallelGatewayAttribute = BaseNodeModel & {
  points?: PointTuple[] & string;
};

class ParallelGatewayModel extends PolygonNodeModel {
  static extendKey = 'ParallelGatewayModel';

  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `ParallelGateway_${getBpmnId()}`;
    }
    if (!data.text) {
      data.text = '';
    }
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y + 40
      };
    }
    super(data, graphModel);
    this.points = [
      [25, 0],
      [50, 25],
      [25, 50],
      [0, 25]
    ];
  }
}

class ParallelGatewayView extends PolygonNode {
  static extendKey = 'ParallelGatewayNode';

  getLabelShape() {
    const attributes = this.getAttributes();
    const { x, y, width, height } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 8,
        y: y - height / 2 + 4,
        width: 43,
        height: 43,
        viewBox: '0 0 1274 1024'
      },
      h('path', {
        fill: '#1890ff',
        d:
          'M901.0739419 470.47863239h-352.81314295v-342.28140848c0-15.79760376-15.79760376-36.86107434-36.86107517-36.86107434-21.0634714 0-36.86107434 21.0634714-36.86107434 42.12694281v342.28140765H132.25724097c-21.0634714-5.26586765-42.12694282 15.79760376-42.12694199 36.86107516s21.0634714 36.86107434 36.86107434 36.86107434h342.28140847v342.28140765c5.26586765 21.0634714 21.0634714 42.12694282 42.12694199 42.12694282s36.86107434-21.0634714 36.86107517-36.86107434v-347.54727613h347.5472753c21.0634714 0 36.86107434-21.0634714 36.86107516-36.86107434s-10.53173528-42.12694282-31.59520751-42.12694281z'
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

const ParallelGateway = {
  type: 'bpmn:parallelGateway',
  view: ParallelGatewayView,
  model: ParallelGatewayModel
};

export { ParallelGatewayView, ParallelGatewayModel };
export default ParallelGateway;
