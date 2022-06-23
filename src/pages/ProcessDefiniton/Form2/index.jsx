import OperateColumnGroup from './OperateColumnGroup'
import MyTable from './MyTable'
import { Button, Modal } from 'antd'
import { useModel } from 'umi'
import { operateChangeColumnOnOk, operateColumnOnOk } from './operateOnOk'
import OperateColumnForm from './OperateColumnForm'
import OperateChangeColumnForm from './OperateChangeColumnForm'
import { Dialog } from 'nowrapper/lib/antd'
import { Space } from '../../../components'
import mapUtil from './mapUtil'
import { ajax, processDefinitionPath } from '../../../utils'

export default () => {
  const { current, setCurrent, map, setMap } = useModel('useProcessDefinition')
  console.log('form2/index---------')
  console.log(map)
  return <div>
    <Space>
      <Button onClick={() => {
        Dialog.show({
          title: '添加字段',
          footerAlign: 'label',
          locale: 'zh',
          enableValidate: true,
          width: 600,
          content: <OperateColumnForm operateType={'add'}/>,
          onOk: async (values, hide) => {
            operateColumnOnOk(values, 'add', null, 'firstData', map, setMap)
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
        //自定义表的字段的下拉树
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
                operateChangeColumnOnOk(values, 'add', null, 'firstData', map, setMap)
                hide()
              }
            })
          }
        }
      }} type='primary'>添加变更字段</Button>
      <OperateColumnGroup/>
    </Space>
    <div style={{ margin: 10 }}/>
    <MyTable dataSourceKey={'firstData'}/>
    <div style={{ marginTop: 10 }}>
      <Button
        onClick={() => {
          setCurrent(current - 1)
        }} type={'primary'} style={{ marginRight: 15 }}>上一步</Button>
      <Button
        onClick={() => {
          setCurrent(current + 1)
        }} type={'primary'}>下一步</Button>
    </div>
  </div>
}
