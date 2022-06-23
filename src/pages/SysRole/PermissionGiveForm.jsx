import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'
import { Tree } from 'antd'

const validate = {
  permissionIdArr: { type: 'array', required: true, message: '菜单不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { permissionGiveVO } = props
  console.log(permissionGiveVO.checkPermissionIdList)
  const [checkedKeys, setCheckedKeys] = useState(permissionGiveVO.checkPermissionIdList)
  const onCheck = (checkedKeys) => {
    setCheckedKeys(checkedKeys)
  //  console.log(checkedKeys)
    core.setValue('permissionIdArr', checkedKeys)
  }

  useEffect(() => {
    core.setValue('permissionIdArr', checkedKeys)
  }, [])

  return <Form core={core}>
    <Tree
      treeData={permissionGiveVO.permissionList}
      checkedKeys={checkedKeys}
      checkable
      defaultExpandAll
      onCheck={onCheck}
    />
    <FormItem name="permissionIdArr"><Input style={{ display: 'none' }}/></FormItem>
  </Form>
}
