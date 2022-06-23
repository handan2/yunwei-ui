import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Input, Radio, Select, TreeSelect } from 'nowrapper/lib/antd'
import { ajax, sysPermissionPath, width } from '../../utils'

const validate = {
  name: { type: 'string', required: true, message: '名称不能为空' },
  type: { type: 'string', required: true, message: '类型不能为空' },
  path: { type: 'string', required: true, message: '前端路由不能为空' },
  permissionType: { type: 'string', required: true, message: '权限类型不能为空' },
  position: { type: 'string', required: true, message: '位置不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { type, record, selectedRowKeys } = props

  if (type === 'add') {
    core.reset()
  } else {
    core.setValues(record)
  }

  const [treeData, setTreeData] = useState([])
  useEffect(async () => {
    const data = await ajax.get(sysPermissionPath.getPermissionTree)
    data && setTreeData(data)
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="类型" name="type" required>
      <Radio.Group
        options={[
          { label: '菜单', value: '菜单' },
          { label: '叶子菜单', value: '叶子菜单' },
          { label: '权限', value: '权限' }]}/>
    </FormItem>
    <FormItem label="上级菜单" name="pid">
      <TreeSelect style={{ width: width }} treeData={treeData} treeDefaultExpandAll/>
    </FormItem>
    <If when={(values) => values.type === '权限'}>
      <>
        <FormItem label="权限类型"
                  name="permissionType"
                  required
                  onSelect={(value, option) => {
                    if (option.props.children === '新增') {
                      core.setValues({ name: option.props.children, icon: 'plus', position: '按钮组' })
                    } else if (option.props.children === '修改') {
                      core.setValues({ name: option.props.children, icon: 'edit', position: '按钮组' })
                    } else if (option.props.children === '浏览') {
                      core.setValues({ name: option.props.children, icon: 'scan', position: '按钮组' })
                    } else if (option.props.children === '删除') {
                      core.setValues({ name: '批量删除', icon: 'delete', position: '按钮组' })
                    } else if (option.props.children === '查询') {
                      core.setValues({ name: option.props.children })
                    } else if (option.props.children === '下载1' || option.props.children === '下载2' || option.props.children === '下载3') {
                      core.setValues({ name: option.props.children, icon: 'download', position: '按钮组' })
                    } else if (option.props.children === '上传1' || option.props.children === '上传2' || option.props.children === '上传3') {
                      core.setValues({ name: option.props.children, icon: 'file-excel', position: '按钮组' })
                    } else if (option.props.children === '角色分配') {
                      core.setValues({ name: option.props.children, icon: 'retweet', position: '按钮组' })
                    } else if (option.props.children === '权限分配') {
                      core.setValues({ name: option.props.children, icon: 'retweet', position: '按钮组' })
                    } else {
                      core.setValues({ name: option.props.children, position: '按钮组' })
                    }
                  }}>
          <Select
            style={{ width: width }}
            options={[
              { label: '新增', value: 'add' },
              { label: '修改', value: 'edit' },
              { label: '浏览', value: 'preview' },
              { label: '删除', value: 'delete' },
              { label: '查询', value: 'query' },
              { label: '角色分配', value: 'roleGive' },
              { label: '权限分配', value: 'permissionGive' },
              { label: '发起流程', value: 'startProcess' },
              { label: '复制', value: 'copy' },
              { label: '审批', value: 'checkProcess' },
              { label: '下载1', value: 'download1' },
              { label: '下载2', value: 'download2' },
              { label: '下载3', value: 'download3' },
              { label: '上传1', value: 'upload1' },
              { label: '上传2', value: 'upload2' },
              { label: '上传3', value: 'upload3' }
            ]}/>
        </FormItem>
        <If when={(values) => values.type === '权限' && values.permissionType !== 'query'}>
          <FormItem label="按钮位置" name="position" required>
            <Radio.Group
              options={[
                { label: '按钮组', value: '按钮组' },
                { label: '数据列表', value: '数据列表' }]}/>
          </FormItem>
        </If>
      </>
    </If>
    <FormItem label="名称" name="name" required><Input style={{ width: width }}/></FormItem>
    <If when={(values) => values.type === '叶子菜单'}>
      <FormItem label="前端路由" name="path" required><Input style={{ width: width }}/></FormItem>
    </If>
    <FormItem label="图标" name="icon"><Input style={{ width: width }}/></FormItem>
    <FormItem label="排序" name="sort"><Input style={{ width: width }}/></FormItem>
    <FormItem label="备注" name="remark"><Input.TextArea style={{ width: width }}/></FormItem>
  </Form>
}
