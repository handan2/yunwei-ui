import Form, { FormCore, FormItem } from 'noform'
import { Checkbox } from 'nowrapper/lib/antd'
import { ajax, sysUserPath, sysRolePath } from '../../utils'
import { useEffect, useState } from 'react'

export default (props) => {
  const core = new FormCore({
    validateConfig: {
      roleIdArr: { type: 'array', required: true, message: '角色不能为空' }
    }
  })
  const [role, setRole] = useState()
  const [checkIdArr, setCheckIdArr] = useState([])

  useEffect(async () => {
    const data = await ajax.get(sysRolePath.getRoleIdVL)
    if (data) {
      setRole(data)
      if (props.roleId) {
        setCheckIdArr(props.roleId.split(','))
        console.log(props.roleId)
      }
    }
  }, [])

  return <Form core={core}>
    <FormItem name="roleIdArr" value={checkIdArr}>
      <Checkbox.Group options={role} className='newLine'/>
    </FormItem>
  </Form>
}
