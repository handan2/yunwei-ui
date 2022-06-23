import { h, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class ArchiveTaskModel extends RectNodeModel {
  static extendKey = 'ArchiveTaskModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Task_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class ArchiveTaskView extends RectNode {
  static extendKey = 'ArchiveTaskNode';
  getLabelShape() {
    const attributes = super.getAttributes();
    const { x, y, width, height, stroke } = attributes;
    return h(
      'svg',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: '0 0 1274 1024',
      },
      h('path', {
        fill: stroke,
        d:
          'M46.545455 209.454545v744.727273h744.727272v-744.727273H46.545455z m0-46.545454h744.727272a46.545455 46.545455 0 0 1 46.545455 46.545454v744.727273a46.545455 46.545455 0 0 1-46.545455 46.545455H46.545455a46.545455 46.545455 0 0 1-46.545455-46.545455v-744.727273a46.545455 46.545455 0 0 1 46.545455-46.545454z m139.543272-43.845818a23.272727 23.272727 0 1 1-46.545454-1.768728l0.930909-24.203636a69.818182 69.818182 0 0 1 69.818182-69.818182h697.995636a69.818182 69.818182 0 0 1 69.818182 69.818182v743.936c0 38.539636-31.232 69.818182-68.421818 69.771636l-20.340364 1.210182a23.272727 23.272727 0 1 1-2.746182-46.498909l21.690182-1.210182a23.272727 23.272727 0 0 0 23.272727-23.272727V93.090909a23.272727 23.272727 0 0 0-23.272727-23.272727H210.385455c-12.893091 0-23.272727 10.426182-23.272728 24.157091l-0.977454 25.088zM209.454545 442.135273h418.909091a23.272727 23.272727 0 1 1 0 46.545454h-418.909091a23.272727 23.272727 0 1 1 0-46.545454z m0 139.636363h279.272728a23.272727 23.272727 0 1 1 0 46.545455h-279.272728a23.272727 23.272727 0 1 1 0-46.545455z',
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

const ArchiveTask = {
  type: 'bpmn:archiveTask',
  view: ArchiveTaskView,
  model: ArchiveTaskModel,
};

export { ArchiveTaskView, ArchiveTaskModel };
export default ArchiveTask;
