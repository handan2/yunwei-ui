import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, Item } from 'noform'
import { Dialog, Input, Radio } from 'nowrapper/lib/antd'
import { message, Divider } from 'antd'
import UserTransfer from './UserTransfer'
import GroupTransfer from './GroupTransfer'
import { ajax, sysDeptPath, sysRolePath, sysUserPath, processFormTemplatePath } from '../../../utils'
import { couldStartTrivia } from 'typescript'
import { map } from 'lodash'


const width = 280

export default (props) => {
  console.log('nodeform-------------')
  const [core] = useState(new FormCore())
  if (props.data) {//这个指是从nodeMap里取的（含DB里已经有的结点 及 DB无但已手工添加过node&第二次打开）
    core.setValues(props.data)
    core.setStatus('operatorTypeLabel', 'disabled')//注意这个setStatus：作用于formItem/Item; operatorTypeLabel就是task表中的同名字段
  } else {//nodeMap没有值，新建的node节点
    //core.reset()
    core.setValues({ taskType: props.node.type, taskDefKey: props.node.id })//
    core.setStatus('operatorTypeLabel', 'disabled')//20220518同上一个逻辑分支，这两种情况这个formItem都是不可编辑状态：可直接在formItem下包装的那个input组件加一个disable属性
    //设置Radio.Group默认选中状态
    if (props.node.type === 'bpmn:startTask') {
      core.setValue('haveNextUser', '否')
      core.setValue('haveSelectAsset', '是')
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
  const [groupTree, setGroupTree] = useState()
  useEffect(async () => {
    const data1 = await ajax.get(sysRolePath.getRoleKT)
    data1 && setRoleArr(data1)
    const data2 = await ajax.get(sysDeptPath.getDeptUserTree)
    data2 && setUserTree(data2)
    //20220603：改造成从map里读
    const data3 = []
    props.map.get('firstData')?.map(item => { if (item.type === '字段组') data3.push({ key: item.id, title: item.label }) })
    //const data3 = await ajax.get(processFormTemplatePath.getGroupKT, { processDefinitionId: props.data?.processDefinitionId })
    data3 && setGroupTree(data3)//测下赋值为null会有啥现象:这个用于Transfer，会报错，顶多可为空数组或干脆不赋值（人家自有默认值）
  }, [])

  const renderItem = () => {
    if (props.node.type === 'bpmn:startTask') {
      return <FormItem name="haveNextUser" label="允许指定下一步处理人">
        <Radio.Group
          options={[
            { label: '是', value: '是' },
            { label: '否', value: '否' }]} />
      </FormItem>
    } else if (props.node.type === 'bpmn:approvalTask') {
      return <>
        <FormItem name="haveComment" label='允许填写审批意见'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveNextUser" label="允许指定下一步处理人">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveEditForm" label="允许修改表单">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
      </>
    } else if (props.node.type === 'bpmn:handleTask') {
      return <>
        <FormItem name="haveOperate" label="允许操作类型">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveComment" label='允许填写备注'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveNextUser" label="允许指定下一步处理人">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveEditForm" label="允许修改表单">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
      </>
    } else if (props.node.type === 'bpmn:archiveTask') {
      return <>
        <FormItem name="haveOperate" label="允许操作类型">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveComment" label='允许填写备注'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="haveEditForm" label="允许修改表单" defaultValue='否'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
      </>
    }
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input style={{ width: width }} /></FormItem>
    <FormItem name="taskType" label='任务类型' style={{ display: 'none' }}><Input style={{ width: width }} /></FormItem>
    <FormItem name="taskDefKey" label='任务标识' style={{ display: 'none' }}><Input style={{ width: width }} /></FormItem>
    <FormItem name='taskName' label='任务名称' required><Input style={{ width: width }} /></FormItem>
    <FormItem name='operatorType' label='operatorType' style={{ display: 'none' }}><Input /></FormItem>
    <FormItem name='operatorTypeValue' label='operatorTypeValue' style={{ display: 'none' }}><Input /></FormItem>
    <FormItem name='haveStarterDept' label='haveStarterDept' style={{ display: 'none' }}><Input /></FormItem>
    <FormItem name='hideGroupIds' label='hideGroupIds' style={{ display: 'none' }}><Input /></FormItem>
    <FormItem label='指定当前处理人' required>
      <div>
        <Item name='operatorTypeLabel'><Input style={{ width: width, marginRight: 5 }} /></Item>
        <a onClick={() => {
          Dialog.show({
            title: '处理人',
            footerAlign: 'label',
            locale: 'zh',
            width: 700,
            content: <UserTransfer core={core} roleArr={roleArr} userTree={userTree} />,//注意这个{core}VS上层Form那个{core},但UserTransfer是自已封装的一个form(且在其内部中并没有把props.core赋值到封装Form的core属性中)
            onOk: async (values, hide) => {
              if (values.operatorType === '角色') {
                if (!values.operatorTypeValue) {
                  message.error('角色不能为空')
                  return
                }
                const data = await ajax.get(sysRolePath.getRoleNameStr, { idArr: values.operatorTypeValue.split(',').map(item => item) })
                if (data) {
                  core.setValues({ operatorType: values.operatorType, operatorTypeLabel: data, operatorTypeValue: values.operatorTypeValue })
                  if (values.haveStarterDept && values.haveStarterDept.length > 0) {
                    //20220522测试core赋值方式:以下两种方式均可
                    core.setValue('haveStarterDept', values.haveStarterDept.join(','))//注意：values.haveStarterDept是数组形式，这里只是为了转成字符串（虽然这个数组实际只有一个值，故分隔符可随便设置符号<只要不和字符串本身冲突了>）
                    // core.setValue({haveStarterDept: values.haveStarterDept.join(',')})
                  }
                  hide()
                }
              } else if (values.operatorType === '用户') {
                if (!values.operatorTypeValue) {
                  message.error('用户不能为空')
                  return
                }
                const data = await ajax.get(sysUserPath.getNameStr, { idArr: values.operatorTypeValue.replaceAll('user', '').split(',').map(item => item) })
                if (data) {
                  core.setValues({
                    haveStarterDept: null,
                    operatorType: values.operatorType,
                    operatorTypeLabel: data,
                    operatorTypeValue: values.operatorTypeValue.replaceAll('user', '')
                  })
                  hide()
                }
              } else {//20211207当处理者是“发起人”时，下面三个属性值都一样  core.setValues({ operatorTypeLabel: '发起人'/values.operatorType,})
                core.setValues({
                  // haveStarterDept: null,
                  operatorType: values.operatorType,
                  operatorTypeLabel: values.operatorType,
                  operatorTypeValue: values.operatorType
                })
                hide()
              }
            }
          })
        }} style={{ fontSize: 15 }}>选择</a>
      </div>
    </FormItem>

    {renderItem()}

    <Divider style={{ fontSize: 14, lineHeight: 0, paddingTop: 20 }}>以下为高级设置</Divider>
    <FormItem label='选择隐藏表单内容'>
      <div>
        <Item name='hideGroupLabel'><Input disabled style={{ width: width, marginRight: 5 }} /></Item>
        <a onClick={() => {
          Dialog.show({
            title: '隐藏表单内容设置',
            footerAlign: 'label',
            locale: 'zh',
            width: 700,
            //20220603 todo改造：groupTree要从model里读:尤其是新建字段组（此时没写进DB）
            content: <GroupTransfer core={core} groupTree={groupTree} />,
            onOk: async (values, hide) => {
              core.setValue('hideGroupLabel', values.hideGroupLabel)
              core.setValue('hideGroupIds', values.hideGroupIds)
              hide()
            }
          })
        }} style={{ fontSize: 15 }}>选择</a>
      </div>
    </FormItem>
    <FormItem name='haveSelectAsset' label="是否可选择设备" defaultValue='否'>
      <Radio.Group
        options={[
          { label: '是', value: '是' },
          { label: '否', value: '否' }]} />
    </FormItem>
    <FormItem name='haveSelectProcess' label="是否可选择后续流程" defaultValue='否'>
      <Radio.Group
        options={[
          { label: '是', value: '是' },
          { label: '否', value: '否' }]} />
    </FormItem>
  </Form>
}
