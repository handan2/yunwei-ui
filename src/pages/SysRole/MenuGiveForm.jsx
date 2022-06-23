import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'
import { Tree } from 'antd'

const validate = {
  menuIdArr: { type: 'array', required: true, message: '菜单不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { menuGiveVO } = props

  const [checkedKeys, setCheckedKeys] = useState(menuGiveVO.checkMenuIdList)
  const onCheck = (checkedKeys) => {
    setCheckedKeys(checkedKeys)
    core.setValue('menuIdArr', checkedKeys)
  }

  useEffect(() => {
    core.setValue('menuIdArr', checkedKeys)
  }, [])

  return <Form core={core}>
    <Tree
      treeData={menuGiveVO.menuList}
      checkedKeys={checkedKeys}
      checkable
      defaultExpandAll
      onCheck={onCheck}
    />
    <FormItem name="menuIdArr"><Input style={{ display: 'none' }}/></FormItem>
  </Form>
}
