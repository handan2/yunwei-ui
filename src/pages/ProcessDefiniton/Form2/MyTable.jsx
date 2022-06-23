import { Icon, Modal, Table } from 'antd'
import { useModel } from 'umi'
import _ from 'lodash'
import mapUtil from './mapUtil'
import arrUpDown from './arrUpDown'
import { Space } from '../../../components'
import { Dialog } from 'nowrapper/lib/antd';
import OperateColumnForm from './OperateColumnForm';
import { operateChangeColumnOnOk, operateColumnOnOk } from './operateOnOk';
import { ajax, processDefinitionPath } from '../../../utils';
import OperateChangeColumnForm from './OperateChangeColumnForm';

export default (props) => {
  const { dataSourceKey } = props

  const { map, setMap, setModalVisitForColumn, setColumnRecord, setColumnOperate, setModalVisitForChange, setChangeRecord, setChangeOperate, setModalVisitForGroup, setGroupRecord, setGroupOperate } = useModel('useProcessDefinition')
  const sort = (record, type) => {
    let newMap = _.cloneDeep(map)
    arrUpDown.sort(newMap.get(dataSourceKey), record, type)
    setMap(newMap)
  }

  const editRecord = async (record) => {
    if (record.flag === '基本类型' || record.flag === '表类型') {
      Dialog.show({
        title: '修改字段',
        footerAlign: 'label',
        locale: 'zh',
        enableValidate: true,
        width: 600,
        content: <OperateColumnForm operateType={'edit'} record={record} />,
        onOk: async (values, hide) => {
          operateColumnOnOk(values, 'edit', record, dataSourceKey, map, setMap)
          hide()
        }
      })
    } else if (record.flag === '字段变更类型') {
      //判断表格里有没有 表类型
      if (JSON.stringify([...map]).indexOf('表类型') < 0) {
        Modal.error({
          title: '提示',
          content: <div>先添加<b style={{ color: 'red' }}>表类型</b>字段</div>,
          closable: true
        })
        return
      }
      //自定义表的字段的下拉树
      let tableNameArr = mapUtil.getTableNameArr(map)
      if (tableNameArr.length > 0) {
        const treeData = await ajax.get(processDefinitionPath.getTreeByTableNames, { tableNameArr: tableNameArr })
        if (treeData) {
          Dialog.show({
            title: '修改变更字段',
            footerAlign: 'label',
            locale: 'zh',
            enableValidate: true,
            width: 600,
            content: <OperateChangeColumnForm operateType={'edit'} treeData={treeData} record={record} />,
            onOk: async (values, hide) => {
              operateChangeColumnOnOk(values, 'edit', record, dataSourceKey, map, setMap)
              hide()
            }
          })
        }
      }
    } else if (record.flag === '字段组类型') {
      setGroupRecord(record)
      setGroupOperate('edit')
      setModalVisitForGroup(true)
    }
  }

  const deleteRecord = (record) => {
    if (record.flag === '基本类型' || record.flag === '表类型' || record.flag === '字段变更类型') {
      let newMap = _.cloneDeep(map)
      let dataSource = []
      map.get(dataSourceKey).forEach(item => {
        if (item.index !== record.index) {
          dataSource.push(item)
        }
      })
      newMap.set(dataSourceKey, dataSource)
      setMap(newMap)
    } else {
      //获取 字段组label
      let labelSet = new Set()
      mapUtil.getGroupLabel(record, labelSet)
      let newMap = _.cloneDeep(map)
      //1
      let dataSource = []
      map.get(dataSourceKey).forEach(item => {
        if (!labelSet.has(item.label)) {
          dataSource.push(item)
        }
      })
      newMap.set(dataSourceKey, dataSource)
      //2
      labelSet.forEach(label => {
        newMap.delete(label)
      })
      setMap(newMap)
    }
  }

  const columns = [
    {
      title: '显示名称',
      dataIndex: 'label',
      render: (text, record) => {
        if (record.flag === '字段变更类型') {
          return <span>{text.split('.')[1]}</span>
        } else {
          return <span>{text}</span>
        }
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text, record) => {
        if (record.flag === '表类型') {
          return <span>{text.split('.')[1]}</span>
        } else {
          return <span>{text}</span>
        }
      }
    },
    {
      title: '数据模型',
      dataIndex: 'flag'
    },
    {
      title: '父字段组',
      dataIndex: 'groupParentLabel'
    },
    {
      title: '是否必填',
      dataIndex: 'required',
      render: (text, record) => {//20211121字段组无须显示此值
        if (record.flag == '字段组类型')
          return <span></span>
        else
          return <span>{text}</span>
      }
    },
    {
      title: '选项内容',
      dataIndex: 'value'
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue'
    },
    {
      title: '操作',
      render: (text, record) => {
        if (dataSourceKey === 'firstData' && !record.groupParentLabel  && record.flag !== '字段组类型') {
          //firstData中的基本类型+表类型
          return <Space>
            <a onClick={() => sort(record, 'up')}><Icon type="arrow-up" />上移</a>
            <a onClick={() => sort(record, 'down')}><Icon type="arrow-down" />下移</a>
            <a onClick={() => editRecord(record)}>修改</a>
            <a onClick={() => deleteRecord(record)}>删除</a>
          </Space>
        } else if (dataSourceKey === 'firstData'   && record.flag === '字段组类型') {
          //firstData中的字段组类型
          return <Space>
            <a onClick={() => sort(record, 'up')}><Icon type="arrow-up" />上移</a>
            <a onClick={() => sort(record, 'down')}><Icon type="arrow-down" />下移</a>
            <a onClick={() => editRecord(record)}>修改</a>
            <a onClick={() => deleteRecord(record)}>删除</a>
          </Space>
        } else if (dataSourceKey !== 'firstData'  && record.flag !== '字段组类型') {
          //字段组中的基本类型+表类型
          return <Space>
            <a onClick={() => sort(record, 'up')}><Icon type="arrow-up" />上移</a>
            <a onClick={() => sort(record, 'down')}><Icon type="arrow-down" />下移</a>
            <a onClick={() => editRecord(record)}>修改</a>
            <a onClick={() => deleteRecord(record)}>删除</a>
          </Space>
        } else if (dataSourceKey !== 'firstData'  && record.flag === '字段组类型') {
          //字段组中的字段组类型
          return <Space>
            <a onClick={() => editRecord(record)}>修改</a>
            <a onClick={() => deleteRecord(record)}>删除</a>
          </Space>
        }
      }
    }]

  return <Table
    bordered
    pagination={false}
    dataSource={mapUtil.getDataSource(map, dataSourceKey)}
    columns={columns}
    rowKey="index"
  />
}
