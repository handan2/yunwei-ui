import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Input, Radio, Select, TreeSelect } from 'nowrapper/lib/antd'


const width = 300

const validate = {
  // loginName: { type: 'string', required: true, message: '登录账号不能为空' },
  // displayName: { type: 'string', required: true, message: '用户姓名不能为空' },
  // password: { type: 'string', required: true, message: '登录密码不能为空' },
  // pid: { type: 'string', required: true, message: '部门不能为空' }
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
  
    <FormItem label="参数详情" name="param"><Input.TextArea  rows={8} style={{ width: 270}}/></FormItem>
  </Form>
}
