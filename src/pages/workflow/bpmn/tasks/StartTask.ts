import { h, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class StartTaskModel extends RectNodeModel {
  static extendKey = 'StartTaskModel';

  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Task_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class StartTaskView extends RectNode {
  static extendKey = 'StartTaskNode';
  getLabelShape() {
    const attributes = super.getAttributes();
    const { x, y, width, height, stroke } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 50,
        height: 28,
        viewBox: '0 0 1274 1024'
      },
      h('path', {
        fill: stroke,
        stroke: stroke,
        strokeWidth: 0,
        d:
          'M683.2 657.9c0.1-0.2 0.2-0.4 0.3-0.5 8.8-16.1 1.3-36.3-16-42.5-2.1-0.7-4.1-1.4-6.2-2.1-1.9-0.6-3.9-1.3-5.9-1.9 18.2-11.1 35.1-24.4 50.6-39.8 50.6-50.6 78.5-117.9 78.5-189.5S756.6 242.7 706 192.1c-50.5-50.5-117.8-78.4-189.4-78.4-71.6 0-138.9 27.9-189.5 78.5-50.6 50.6-78.5 117.9-78.5 189.5 0 47.9 12.8 94.8 37 135.9 8.4 14.3 26.8 19 41.1 10.6s19-26.8 10.6-41.1c-18.7-31.8-28.7-68.3-28.7-105.4 0-114.9 93.6-208.3 208.5-208 114 0.3 207.2 93.4 207.5 207.5 0.3 114.9-93.1 208.5-208 208.5-4.3 0-8.4 0.9-12.1 2.6-36.5 1.2-71.1 7.6-103 19.2-34.2 12.4-66.2 31.1-95.4 55.6-52.7 44.3-97.6 108.3-137.2 195.8-6.8 15.1-0.1 32.9 14.9 39.7 4 1.8 8.2 2.7 12.4 2.7 11.4 0 22.3-6.6 27.3-17.6 73.8-162.8 164.2-235.5 293-235.5 50.6 0 93.4 6.2 130.6 19.4 13.8 4.9 29.2-0.8 36.1-13.7zM856.9 736.5c0.1-0.3 0.2-0.6 0.2-0.9 0.1-0.3 0.1-0.6 0.2-1 0.1-0.3 0.1-0.6 0.2-0.9 0-0.3 0.1-0.6 0.1-1 0-0.3 0.1-0.6 0.1-0.9v-1-0.9-0.9-1c0-0.3-0.1-0.6-0.1-0.9 0-0.3-0.1-0.7-0.1-1 0-0.3-0.1-0.6-0.2-0.9-0.1-0.3-0.1-0.6-0.2-1-0.1-0.3-0.2-0.6-0.2-0.9-0.1-0.3-0.2-0.6-0.2-0.9-0.1-0.3-0.2-0.7-0.3-1-0.1-0.2-0.1-0.4-0.2-0.7 0-0.1 0-0.1-0.1-0.1-0.1-0.3-0.3-0.7-0.4-1-0.1-0.2-0.2-0.5-0.3-0.7-0.2-0.3-0.3-0.6-0.5-0.9-0.1-0.2-0.3-0.5-0.4-0.7-0.2-0.3-0.3-0.5-0.5-0.8-0.2-0.3-0.3-0.5-0.5-0.8-0.2-0.2-0.3-0.5-0.5-0.7-0.2-0.3-0.4-0.5-0.6-0.8-0.2-0.2-0.4-0.4-0.5-0.6-0.2-0.3-0.5-0.6-0.7-0.8l-0.6-0.6-0.8-0.8-0.1-0.1-64-58c-10.2-9.3-26-8.5-35.3 1.7-9.3 10.2-8.5 26 1.7 35.3l16 14.5h-40.2c-76.1 0-138 61.9-138 138v31.3c0 13.8 11.2 25 25 25s25-11.2 25-25V843c0-48.5 39.5-88 88-88H768l-16 14.5c-10.2 9.3-11 25.1-1.7 35.3 4.9 5.4 11.7 8.2 18.5 8.2 6 0 12-2.1 16.8-6.5l64-58 0.1-0.1 0.8-0.8 0.6-0.6c0.2-0.3 0.5-0.5 0.7-0.8 0.2-0.2 0.4-0.4 0.5-0.6 0.2-0.3 0.4-0.5 0.6-0.8 0.2-0.2 0.4-0.5 0.5-0.7 0.2-0.3 0.3-0.5 0.5-0.8 0.2-0.3 0.3-0.5 0.5-0.8 0.1-0.2 0.3-0.5 0.4-0.7 0.2-0.3 0.3-0.6 0.5-0.9 0.1-0.2 0.2-0.5 0.3-0.7 0.1-0.3 0.3-0.7 0.4-1 0 0 0-0.1 0.1-0.1 0.1-0.2 0.1-0.4 0.2-0.7 0.1-0.3 0.2-0.6 0.3-1 0.2-0.3 0.2-0.6 0.3-0.9z'
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
      radius
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
        height
      }),
      this.getLabelShape()
    ]);
  }
}

const StartTask = {
  type: 'bpmn:startTask',
  view: StartTaskView,
  model: StartTaskModel
};

export { StartTaskView, StartTaskModel };
export default StartTask;