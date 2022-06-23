import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'
import { width } from '../../utils'

const validate = {
  name: { type: 'string', required: true, message: '角色名称不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { type, record } = props

  if (type === 'add') {
    core.reset()
  } else {
    core.setValues(record)
  }

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="角色名称" name="name" required><Input style={{ width: width }}/></FormItem>
    <FormItem label="备注" name="remark"><Input.TextArea style={{ width: width }}/></FormItem>
  </Form>
}
