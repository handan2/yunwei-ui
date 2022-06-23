import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, Item } from 'noform'
import { Dialog, Input, Radio } from 'nowrapper/lib/antd'
import { message } from 'antd'
import UserTransfer from './UserTransfer'
import { ajax, sysDeptPath, sysRolePath, sysUserPath } from '../../../utils'

const width = 280

export default (props) => {
  const [core] = useState(new FormCore())

  if (props.data) {
    core.setValues(props.data)
    core.setStatus('typeLabel', 'disabled')//注意这个setStatus; typeLabel就是task表中的同名字段
  } else {
    core.reset()
    core.setValues({ taskType: props.node.type, taskId: props.node.id })
    core.setStatus('typeLabel', 'disabled')
    if (props.node.type === 'bpmn:startTask') {
      core.setValue('haveNextUser', '否')
    } else if (props.node.type === 'bpmn:approvalTask') {
      core.setValues({ haveComment: '否', haveNextUser: '否', haveEditForm: '否' })
    } else if (props.node.type === 'bpmn:handleTask') {
      core.setValues({ haveOperate: '是', haveComment: '是', haveNextUser: '否', haveEditForm: '否' })
    } else if (props.node.type === 'bpmn:archiveTask') {
      core.setValues({ haveOperate: '否', haveComment: '否', haveEditForm: '否' })
    }
  }

  const [roleArr, setRoleArr] = useState()
  const [userTree, setUserTree] = useState()
  useEffect(async () => {
    const data1 = await ajax.get(sysRolePath.getRoleKT)
    data1 && setRoleArr(data1)
    const data2 = await ajax.get(sysDeptPath.getDeptUserTree)
    data2 && setUserTree(data2)
  }, [])

  const renderItem = () => {
    if (props.node.type === 'bpmn:startTask') {
      return <FormItem name="haveNextUser" label="允许指定下一步处理人">
        <Radio.Group
          options={[
            { label: '是', value: '是' },
            { label: '否', value: '否' }]}/>
      </FormItem>
    } else if (props.node.type === 'bpmn:approvalTask') {
      return <>
        <FormItem name="haveComment" label='允许填写审批意见'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveNextUser" label="允许指定下一步处理人">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveEditForm" label="允许修改表单">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
      </>
    } else if (props.node.type === 'bpmn:handleTask') {
      return <>
        <FormItem name="haveOperate" label="允许操作类型">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveComment" label='允许填写备注'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveNextUser" label="允许指定下一步处理人">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveEditForm" label="允许修改表单">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
      </>
    } else if (props.node.type === 'bpmn:archiveTask') {
      return <>
        <FormItem name="haveOperate" label="允许操作类型">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveComment" label='允许填写备注'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name="haveEditForm" label="允许修改表单">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
      </>
    }
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input style={{ width: width }}/></FormItem>
    <FormItem name="taskType" label='任务类型' style={{ display: 'none' }}><Input style={{ width: width }}/></FormItem>
    <FormItem name="taskId" label='任务标识' style={{ display: 'none' }}><Input style={{ width: width }}/></FormItem>
    <FormItem name='taskName' label='任务名称' required><Input style={{ width: width }}/></FormItem>
    <FormItem name='type' label='type' style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name='typeValue' label='typeValue' style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name='haveStarterDept' label='haveStarterDept' style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label='指定当前处理人' required>
      <div>
        <Item name='typeLabel'><Input style={{ width: width, marginRight: 5 }}/></Item>
        <a onClick={() => {
          Dialog.show({
            title: '处理人',
            footerAlign: 'label',
            locale: 'zh',
            width: 700,
            content: <UserTransfer core={core} roleArr={roleArr} userTree={userTree}/>,//注意这个{core}VS上层Form那个{core}
            onOk: async (values, hide) => {
              if (values.type === '角色') {
                if (!values.typeValue) {
                  message.error('角色不能为空')
                  return
                }
                const data = await ajax.get(sysRolePath.getRoleNameStr, { idArr: values.typeValue.split(',').map(item => item) })
                if (data) {
                  core.setValues({ type: values.type, typeLabel: data, typeValue: values.typeValue })
                  if (values.haveStarterDept && values.haveStarterDept.length > 0) {
                    core.setValue('haveStarterDept', values.haveStarterDept.join(','))//这个join有点脱裤子放P，本身只有一个值
                  }
                  hide()
                }
              } else if (values.type === '用户') {
                if (!values.typeValue) {
                  message.error('用户不能为空')
                  return
                }
                const data = await ajax.get(sysUserPath.getNameStr, { idArr: values.typeValue.replaceAll('user', '').split(',').map(item => item) })
                if (data) {
                  core.setValues({
                    haveStarterDept: null,
                    type: values.type,
                    typeLabel: data,
                    typeValue: values.typeValue.replaceAll('user', '')
                  })
                  hide()
                }
              } else {//20211207todo  core.setValues({ typeLabel: '发起人'/values.type,})
                core.setValues({
                 // haveStarterDept: null,
                  type: values.type,
                  typeLabel: values.type,
                  typeValue: values.type
                })
                hide()
              }
            }
          })
        }} style={{ fontSize: 15 }}>选择</a>
      </div>
    </FormItem>
    {renderItem()}
  </Form>
}
