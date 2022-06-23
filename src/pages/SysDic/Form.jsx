import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'

const validate = {
  flag: { type: 'string', required: true, message: '大类名称不能为空' },
  name: { type: 'string', required: true, message: '小类名称不能为空' }
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
    <FormItem label="大类名称" name="flag" required><Input/></FormItem>
    <FormItem label="小类名称" name="name" required><Input/></FormItem>
  </Form>
}
