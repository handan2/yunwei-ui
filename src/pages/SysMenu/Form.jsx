import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Input, Radio, TreeSelect } from 'nowrapper/lib/antd'
import { ajax, sysMenuPath, width } from '../../utils'

const validate = {
  name: { type: 'string', required: true, message: '名称不能为空' },
  type: { type: 'string', required: true, message: '类型不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { type, record, selectedRowKeys } = props

  if (type === 'add') {
    core.reset()
    //设置pid
    selectedRowKeys[0] && core.setValue('pid', selectedRowKeys[0])
  } else {
    core.setValues(record)
  }

  const [treeData, setTreeData] = useState()
  useEffect(async () => {
    const data = await ajax.get(sysMenuPath.getMenuTree)
    setTreeData(data)
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="类型" name="flag" required>
      <Radio.Group
        style={{ width: width }}
        options={[
          { label: '菜单', value: '菜单' },
          { label: '按钮', value: '按钮' },
          { label: '查询', value: '查询' }]}/>
    </FormItem>
    <FormItem label="名称" name="name" required><Input style={{ width: width }}/></FormItem>
    <FormItem label="上级菜单" name="pid">
      <TreeSelect style={{ width: width }} treeData={treeData} treeDefaultExpandAll/>
    </FormItem>
    <If when={(values) => values.flag === '菜单'}>
      <FormItem label="前端路由" name="path"><Input style={{ width: width }}/></FormItem>
      <FormItem label="图标" name="icon"><Input style={{ width: width }}/></FormItem>
    </If>
    <FormItem label="排序" name="sort"><Input style={{ width: width }}/></FormItem>
  </Form>
}
