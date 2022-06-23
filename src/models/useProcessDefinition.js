import { useState } from 'react'

export default () => {
  /**
   * map的数据结构，用于form2的数据存储
   * {
   *   firstData:Form2的第一层次表格数据
   *   index:全局计数器，用于表格拖拽排序时，需要的index的标志位
   *   group: 临时分组数据
   *   组名称1：分组数据1
   *   组名称2：分组数据2
   *   组名称3：分组数据3
   *   ....
   *   组名称n:分组数据n
   * }
   */
  let initMap = new Map()
  initMap.set('firstData', [])
  initMap.set('index', 1)
  initMap.set('group', [])
  const [map, setMap] = useState(initMap)

  const [current, setCurrent] = useState(0)
  const [modalVisit, setModalVisit] = useState(false)
  const [type, setType] = useState()
  const [title, setTitle] = useState()
  const [record, setRecord] = useState()
  const [form1Core, setForm1Core] = useState()

  const [modalVisitForGroup, setModalVisitForGroup] = useState(false)
  const [groupRecord, setGroupRecord] = useState()
  const [groupOperate, setGroupOperate] = useState('add')

  const [form1Data, setForm1Data] = useState()
  const [form3Data, setForm3Data] = useState()

  return {
    map, setMap,
    current, setCurrent,
    modalVisit, setModalVisit,
    type, setType,
    title, setTitle,
    record, setRecord,
    form1Core, setForm1Core,
    modalVisitForGroup, setModalVisitForGroup,
    groupRecord, setGroupRecord,
    groupOperate, setGroupOperate,
    form1Data, setForm1Data,
    form3Data, setForm3Data,
  }
}
