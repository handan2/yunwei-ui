import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Input, Radio, Select, TreeSelect } from 'nowrapper/lib/antd'
import { ajax, sysDeptPath } from '../../utils'

const width = 300

const validate = {
  loginName: { type: 'string', required: true, message: '登录账号不能为空' },
  displayName: { type: 'string', required: true, message: '用户姓名不能为空' },
  password: { type: 'string', required: true, message: '登录密码不能为空' },
  pid: { type: 'string', required: true, message: '部门不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
 
  const { type, record } = props

  if (type === 'add') {
    core.reset()
    //
    core.setValues({ secretDegree: '非密', gender: '男' })
  } else {
    console.log(record)
    core.setValues(record)
  }

  const [treeData, setTreeData] = useState()
  useEffect(async () => {
    const data = await ajax.get(sysDeptPath.getDeptTree)
    setTreeData(data)
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input style={{ width: width }}/></FormItem>
    <FormItem label="登录账号" name="loginName" required><Input style={{ width: width }}/></FormItem>
    <FormItem label="用户姓名" name="displayName" required><Input style={{ width: width }}/></FormItem>
    <If when={(values) => values.id === null}>
      <FormItem label="登录密码" name="password" required><Input style={{ width: width }}/></FormItem>
    </If>
    <FormItem label="密级" name="secretDegree" required>
      <Select
        style={{ width: width }}
        options={[
          { label: '一般', value: '一般' },
          { label: '重要', value: '重要' },
          { label: '核心', value: '核心' },
          { label: '非密', value: '非密' }]}/>
    </FormItem>
    <FormItem label="部门分配" name="deptId" required>
      <TreeSelect style={{ width: width }} treeData={treeData} treeDefaultExpandAll/>
    </FormItem>
    <FormItem label="身份证号" name="idNumber"><Input style={{ width: width }}/></FormItem>
    <FormItem label="手机号码" name="mobile"><Input style={{ width: width }}/></FormItem>
    <FormItem label="座机号" name="telephone"><Input style={{ width: width }}/></FormItem>
    <FormItem label="位置" name="location"><Input style={{ width: width }}/></FormItem>
    <FormItem label="性别" name="gender">
      <Radio.Group
        options={[
          { label: '男', value: '男' },
          { label: '女', value: '女' }]}/>
    </FormItem>
    <FormItem label="邮箱" name="email"><Input style={{ width: width }}/></FormItem>
    <FormItem label="备注" name="remark"><Input.TextArea style={{ width: width }}/></FormItem>
  </Form>
}
