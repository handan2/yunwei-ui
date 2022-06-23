import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem } from 'noform'
import { Input, TreeSelect } from 'nowrapper/lib/antd'
import { ajax, sysDeptPath, width } from '../../utils'

const validate = {
  name: { type: 'string', required: true, message: '部门名称不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { type, record } = props
  if (type === 'add') {
    core.reset()
  } else {
    core.setValues(record)
  }

  const [treeData, setTreeData] = useState()
  useEffect(async () => {
    const data = await ajax.get(sysDeptPath.getDeptTree)
    setTreeData(data)
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name="pid" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="部门名称" name="name" required><Input style={{ width: width }}/></FormItem>
    <FormItem label="上级部门" name="pid">
      <TreeSelect style={{ width: width }} treeData={treeData} treeDefaultExpandAll/>
    </FormItem>
  </Form>
}
