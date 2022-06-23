//前后端都可以实现结构树的方法，https://blog.csdn.net/bertZuo/article/details/107200165
import _ from 'lodash'

export default {
  //获取 表类型的名称
  getTableNameArr(map) {
    let tableNameArr = []
    for (let value of map.values()) {
      if (typeof value === 'object') {
        value.forEach(item => {
          if (item.flag === '表类型') {
            tableNameArr.push(item.type)
          }
        })
      }
    }
    return tableNameArr
  },
  //添加字段组时，先遍历出结构树
  getGroupTree(map) {
    //先遍历出map中所有的flag=字段组类型
    let itemArr = []
    for (let value of map.values()) {
      if (typeof value === 'object') {
        value.forEach(item => {
          if (item.flag === '字段组类型') {
            itemArr.push({
              title: item.label,
              value: item.label,
              key: item.label,
              groupParentLabel: item.groupParentLabel
            })
          }
        })
      }
    }
    /**
     * 组装结构树
     * mapTmp 存放每个对象
     */
    const mapTmp = new Map()
    const groupTree = []

    itemArr.forEach(item => {
      mapTmp.set(item.key, item)
    })

    itemArr.forEach(item => {
      const parent = mapTmp.get(item.groupParentLabel)
      if (parent) {
        (parent.children || (parent.children = [])).push(item);
      } else {
        groupTree.push(item);
      }
    })
    // console.log('groupTree', groupTree);
    return groupTree
  },
  //判断有没有 表类型
  haveTableType(map, tableType) {
    let len = 0
    for (let value of map.values()) {
      if (typeof value === 'object') {
        value.forEach(item => {
          if (item.flag === '表类型') {
            if (item.type === tableType) {
              len = len + 1
            }
          }
        })
      }
    }
    return len > 0
  },
  //判断有没有 变更字段
  haveChangeColumn(map, name) {
    let len = 0
    for (let value of map.values()) {
      if (typeof value === 'object') {
        value.forEach(item => {
          if (item.flag === '字段变更类型') {
            if (item.name === name) {
              len = len + 1
            }
          }
        })
      }
    }
    return len > 0
  },
  //判断有没有 字段组label
  haveGroupLabel(map, label) {
    let len = 0
    for (let value of map.values()) {
      if (typeof value === 'object') {
        value.forEach(item => {
          if (item.flag === '字段组类型') {
            if (item.label === label) {
              len = len + 1
            }
          }
        })
      }
    }
    return len > 0
  },
  //将map中的数据，组装成树，方便查看层次结构
  getDataSource(map, dataSourceKey) {
    if (dataSourceKey === 'firstData') {
      const mapTmp = new Map()
      const tree = []
      let newMap = _.cloneDeep(map)
      newMap.get(dataSourceKey).forEach(item => {
        if (item.flag === '字段组类型') {
          mapTmp.set(item.label, item)
        } else {
          mapTmp.set(item.index + item.label, item)
        }
      })
      newMap.get(dataSourceKey).forEach(item => {
        if (item.flag === '字段组类型') {
          let groupParentLabel = item.groupParentLabel
          if (groupParentLabel) {
            let parent = mapTmp.get(groupParentLabel)
            //
            let data = mapTmp.get(item.label)
            let group = newMap.get(item.label)
            let children = []
            group.forEach(itemm => {
              itemm.groupParentLabel = item.label
              children.push(itemm)
            })
            data.children = children

            if (parent.children) {
              parent.children.push(data)
            } else {
              parent.children = [data]
            }
          } else {
            let data = mapTmp.get(item.label)
            //
            let group = newMap.get(item.label)
            let children = []
            group.forEach(itemm => {
              itemm.groupParentLabel = item.label
              children.push(itemm)
            })
            data.children = children

            tree.push(data)
          }
        } else {
          tree.push(mapTmp.get(item.index + item.label))
        }
      })
      return tree
    } else {
      return map.get(dataSourceKey)
    }
  },
  //遍历出字段组下，所有的子字段组，包含自己
  getGroupLabel(record, labelSet) {
    labelSet.add(record.label)
    record.children.forEach(item => {
      if (item.flag === '字段组类型') {
        this.getGroupLabel(item, labelSet)
      }
    })
  }
}
