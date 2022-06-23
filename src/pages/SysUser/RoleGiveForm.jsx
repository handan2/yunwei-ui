import Form, { FormCore, FormItem } from 'noform'
import { Checkbox } from 'nowrapper/lib/antd'

const validate = {
  roleIdArr: { type: 'array', required: true, message: '角色不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { roleGiveVO } = props
  return <Form core={core}>
    <FormItem name="roleIdArr" value={roleGiveVO.checkRoleIdList}>
      <Checkbox.Group options={roleGiveVO.roleList} className='newLine'/>
    </FormItem>
  </Form>
}
