import mapUtil from './mapUtil'
import { Modal } from 'antd'
import _ from 'lodash'
//20220428 operateType:add/edit;dataSourceKey对应model/map里的"group"/字段组的label
export function operateColumnOnOk(values, operateType, record, dataSourceKey, map, setMap) {
  if (values.type === '文本框' || values.type === '数字框' || values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑' || values.type === '日期' || values.type === '日期时间') {
    values.flag = '基本类型'
  } else {
    values.flag = '表类型'
  }
  if (operateType === 'add') {
    values.index = map.get('index')
    //如果是 表类型，不可重复插入
    if (values.flag === '表类型') {
      if (mapUtil.haveTableType(map, values.type)) {
        Modal.warning({
          title: '提示',
          content: <div><b style={{ color: 'red' }}>{values.type}</b>不能重复添加</div>,
          closable: true
        })
        return
      }
    }
    //
    let newMap = _.cloneDeep(map)
    newMap.get(dataSourceKey).push(values)
    newMap.set('index', newMap.get('index') + 1)
    setMap(newMap)
  } else {
    //如果是 表类型，不可重复插入
    if (values.flag === '表类型' && record.type !== values.type) {
      if (mapUtil.haveTableType(map, values.type)) {
        Modal.warning({
          title: '提示',
          content: <div><b style={{ color: 'red' }}>{values.type}</b>不能重复添加</div>,
          closable: true
        })
        return
      }
    }
    let newMap = _.cloneDeep(map)
    let dataSource = []
    map.get(dataSourceKey).forEach(item => {
      if (item.index === values.index) {
        dataSource.push(values)
      } else {
        dataSource.push(item)
      }
    })
    newMap.set(dataSourceKey, dataSource)
    setMap(newMap)
  }
}

export function operateChangeColumnOnOk(values, operateType, record, dataSourceKey, map, setMap) {
  if (operateType === 'add') {
    values.index = map.get('index')
    values.flag = '字段变更类型'
    //变更字段 不能重复添加
    if (mapUtil.haveChangeColumn(map, values.name)) {
      Modal.warning({
        title: '提示',
        content: <div><b style={{ color: 'red' }}>{values.label}</b>不能重复添加</div>,
        closable: true
      })
      return
    }
    //
    let newMap = _.cloneDeep(map)
    newMap.get(dataSourceKey).push(values)
    newMap.set('index', newMap.get('index') + 1)
    setMap(newMap)
  } else {
    if (record.name !== values.name) {
      if (mapUtil.haveChangeColumn(map, values.name)) {
        Modal.warning({
          title: '提示',
          content: <div><b style={{ color: 'red' }}>{values.label}</b>不能重复添加</div>,
          closable: true
        })
        return
      }
    }
    let newMap = _.cloneDeep(map)
    let dataSource = []
    map.get(dataSourceKey).forEach(item => {
      if (item.index === values.index) {
        dataSource.push(values)
      } else {
        dataSource.push(item)
      }
    })
    newMap.set(dataSourceKey, dataSource)
    setMap(newMap)
  }
}
