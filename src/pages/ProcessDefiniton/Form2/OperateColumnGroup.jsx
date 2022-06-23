import { useEffect, useState } from 'react'
import { Button, Modal } from 'antd'
import { useModel } from 'umi'
import Form, { FormCore, FormItem } from 'noform'
import { Dialog, Input, Radio, Select, TreeSelect } from 'nowrapper/lib/antd'
import _ from 'lodash'
import mapUtil from './mapUtil'
import MyTable from './MyTable'
import { Space } from '../../../components'
import OperateColumnForm from './OperateColumnForm';
import { operateChangeColumnOnOk, operateColumnOnOk } from './operateOnOk'
import { ajax, processDefinitionPath } from '../../../utils'
import OperateChangeColumnForm from './OperateChangeColumnForm'

const core = new FormCore({
  validateConfig: {
    label: { type: 'string', required: true, message: '字段组名称不能为空' }
  }
})
let newColumnGroupsCodeForID  = -100//202206503 用于给新增字段组临时分配ID（真实的ID在传到后台&写入DB才能获取，负数为了后台区分是不是“新增”）；用于“隐藏字段组设置”
export default () => {
  const { map, setMap, modalVisitForGroup, setModalVisitForGroup, groupRecord, groupOperate, setGroupOperate } = useModel('useProcessDefinition')
  const [treeData, setTreeData] = useState([])

  if (groupOperate === 'edit') {
    core.setValues(groupRecord)
  }

  useEffect(() => {
    setTreeData(mapUtil.getGroupTree(map))
  }, [map])

  return <>
    <Button onClick={() => {
      core.reset()
      core.setValues({ groupLayout: 2, haveGroupSelect: '否' })
      setGroupOperate('add')
      setModalVisitForGroup(true)
    }} type={'primary'}>添加字段组</Button>
    <Modal
      title={groupOperate === 'add' ? '添加字段组' : '修改字段组'}
      visible={modalVisitForGroup}
      width={'95%'}
      onOk={async () => {
        const errors = await core.validate()
        if (!errors) {
          let values = core.getValues()
          console.log('添加完字段组后的保存方法')
          console.log( values )
          if (groupOperate === 'add') {
            values.type = '字段组'
            values.flag = '字段组类型'
            //20220604 给新增字段组 表单对象加个临时ID(之前是没有的)
            values.id = newColumnGroupsCodeForID++
            //字段组 不能重复添加
            if (mapUtil.haveGroupLabel(map, values.label)) {
              Modal.warning({
                title: '提示',
                content: <div><b style={{ color: 'red' }}>{values.label}</b>不能重复添加</div>,
                closable: true
              })
              core.setValue('label', '')
              return
            }
            //字段组不能为空
            if (map.get('group').length === 0) {
              Modal.warning({
                title: '提示',
                content: <div><b style={{ color: 'red' }}>字段组</b>必须有字段</div>,
                closable: true
              })
              return
            }
            values.index = map.get('index')
            let newMap = _.cloneDeep(map)
            newMap.get('firstData').push(values)
            newMap.set('index', newMap.get('index') + 1)
            //将数据从group中移动到label中;'group'对应的map：仅用于字段组的添加/编辑界面在打开的情况下使用，在关闭前（此时并未写入DB）需要将其清空
            let dataSource = newMap.get('group')
            newMap.set(values.label, dataSource)
            newMap.set('group', [])
            setMap(newMap)
          } else {
            if (groupRecord.label !== values.label) {
              if (mapUtil.haveGroupLabel(map, values.label)) {
                Modal.warning({
                  title: '提示',
                  content: <div><b style={{ color: 'red' }}>{values.label}</b>不能重复添加</div>,
                  closable: true
                })
                core.setValue('label', '')
                return
              }
            }
            //父字段组，不能选择自己
            if (values.label === values.groupParentLabel) {
              Modal.warning({
                title: '提示',
                content: <div>请重新选择<b style={{ color: 'red' }}>父字段组</b></div>,
                closable: true
              })
              core.setValue('groupParentLabel', '')
              return
            }

            let newMap = _.cloneDeep(map)
            //
            let parentDataSource = []
            newMap.get('firstData').forEach(item => {
              if (item.index === values.index) {
                parentDataSource.push(values)
              } else {
                //字段组名称改变了,修改child的groupParentLabel
                if (groupRecord.label !== values.label && item.flag === '字段组类型') {
                  if (item.groupParentLabel === groupRecord.label) {
                    item.groupParentLabel = values.label
                  }
                }
                parentDataSource.push(item)
              }
            })
            newMap.set('firstData', parentDataSource)
            //字段组名称改变了
            if (groupRecord.label !== values.label) {
              newMap.set(values.label, [...newMap.get(groupRecord.label)])
              newMap.delete(groupRecord.label)
            }
            setMap(newMap)
          }
          setModalVisitForGroup(false)
        }
      }}
      onCancel={() => {
        setModalVisitForGroup(false)
      }}
      keyboard={false}
    >
      <Form core={core} inline style={{ marginTop: -20 }} defaultMinWidth={false}>
        <FormItem name='index' label='索引' style={{ display: 'none' }}><Input/></FormItem>
        <FormItem name='groupParentLabel' label='父字段组'>
          <TreeSelect treeData={treeData} treeDefaultExpandAll style={{ width: 200, marginRight: 20 }}/>
        </FormItem>
        <FormItem name='label' label='字段组名称' required><Input style={{ width: 200, marginRight: 20 }}/></FormItem>
        <FormItem name='groupLayout' label='字段组布局'>
          <Select style={{ width: 150, marginRight: 20 }}
                  options={[
                    { label: '一行一列', value: 1 },
                    { label: '一行两列', value: 2 },
                    { label: '一行三列', value: 3 },
                    { label: '一行四列', value: 4 }]}/>
        </FormItem>
        <FormItem name="haveGroupSelect" label="字段组选择">
          <Radio.Group style={{ width: 100 }}
                       options={[
                         { label: '是', value: '是' },
                         { label: '否', value: '否' }]}/>
        </FormItem>
      </Form>
      <Space style={{ marginTop: 10 }}>
        <Button onClick={() => {
          Dialog.show({
            title: '添加字段',
            footerAlign: 'label',
            locale: 'zh',
            enableValidate: true,
            width: 600,
            content: <OperateColumnForm operateType={'add'}/>,
            onOk: async (values, hide) => {
              operateColumnOnOk(values, 'add', null, groupOperate === 'add' ? 'group' : groupRecord.label, map, setMap)
              hide()
            }
          })
        }} type='primary'>添加字段</Button>
        <Button onClick={async () => {
          //判断表格里有没有 表类型
          if (JSON.stringify([...map]).indexOf('表类型') < 0) {
            Modal.error({
              title: '提示',
              content: <div>先添加<b style={{ color: 'red' }}>表类型</b>字段</div>,
              closable: true
            })
            return
          }
          //自定义表的字段的下拉树：就两层结构：第一层是自定表名（可多个），第二层是表的字段
          let tableNameArr = mapUtil.getTableNameArr(map)
          if (tableNameArr.length > 0) {
            const treeData = await ajax.get(processDefinitionPath.getTreeByTableNames, { tableNameArr: tableNameArr })
            if (treeData) {
              Dialog.show({
                title: '添加变更字段',
                footerAlign: 'label',
                locale: 'zh',
                enableValidate: true,
                width: 600,
                content: <OperateChangeColumnForm operateType={'add'} treeData={treeData}/>,
                onOk: async (values, hide) => {
                  operateChangeColumnOnOk(values, 'add', null, groupOperate === 'add' ? 'group' : groupRecord.label, map, setMap)
                  hide()
                }
              })
            }
          }
        }} type='primary'>添加变更字段</Button>
      </Space>
      <div style={{ marginTop: 10 }}/>
      <MyTable dataSourceKey={groupOperate === 'add' ? 'group' : groupRecord.label}/>
    </Modal>
  </>
}
