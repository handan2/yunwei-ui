import { h, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class HandleTaskModel extends RectNodeModel {
  static extendKey = 'HandleTaskModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Task_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class HandleTaskView extends RectNode {
  static extendKey = 'HandleTaskNode';
  getLabelShape() {
    const attributes = super.getAttributes();
    const { x, y, width, height, stroke } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 50,
        height: 27,
        viewBox: '0 0 1274 1024',
      },
      h('path', {
        fill: stroke,
        d:
          'M360.675556 532.906667a227.555556 227.555556 0 1 1 245.731555 0 369.493333 369.493333 0 0 1 148.536889 97.706666 28.444444 28.444444 0 0 1-41.756444 38.656A311.921778 311.921778 0 0 0 483.555556 568.888889c-172.8 0-312.888889 140.088889-312.888889 312.888889a28.444444 28.444444 0 0 1-56.888889 0c0-161.137778 103.082667-298.211556 246.897778-348.871111zM483.555556 512a170.666667 170.666667 0 1 0 0-341.333333 170.666667 170.666667 0 0 0 0 341.333333z m189.354666 321.820444l181.020445-181.020444a28.444444 28.444444 0 1 1 40.220444 40.220444l-221.240889 221.240889-140.8-140.8a28.444444 28.444444 0 1 1 40.220445-40.220444l100.579555 100.579555z',
      })
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

const HandleTask = {
  type: 'bpmn:handleTask',
  view: HandleTaskView,
  model: HandleTaskModel,
};

export { HandleTaskView, HandleTaskModel };
export default HandleTask;
