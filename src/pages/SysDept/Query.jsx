import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'
import { Button } from 'antd'

const core = new FormCore()

//查询表单方式二：利用noform
export default (props) => {
  const { list } = props
  const onClick = (type) => {
    if (type === 'query') {
      let params = {}
      let values = core.getValues()
      Object.keys(values).forEach(key => {
        if (values[key]) {
          params[key] = values[key]
        }
      })
      list.setParams(params)
      list.refresh()
    } else {
      core.reset()
      list.setParams({})
      list.refresh()
    }
  }
  return <Form core={core} inline>
    <FormItem label="部门名称" name="name"><Input/></FormItem>
    <Button icon='search' type='primary' style={{ marginLeft: 10 }} onClick={() => onClick('query')}>查询</Button>
    <Button icon='reload' style={{ marginLeft: 10 }} onClick={() => onClick('reload')}>重置</Button>
  </Form>
}
