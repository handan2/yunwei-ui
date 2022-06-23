import Form, { FormCore, FormItem, Item } from 'noform'
import { Dialog, Input, Radio, Select } from 'nowrapper/lib/antd'
import { ajax, sysDicPath } from '../../utils'
import React, { useEffect, useState } from 'react'
import { Button, message } from 'antd'
import { useModel } from 'umi'
import RoleGiveForm from './RoleGiveForm'

const width = 300

export default () => {
  const [form1Core] = useState(new FormCore({
    validateConfig: {
      processName: { type: 'string', required: true, message: '流程名称不能为空' },
      processType: { type: 'string', required: true, message: '流程分类不能为空' },
      processType2: { type: 'string', required: true, message: '流程分类2不能为空' }
    }
  }))

  const { current, setCurrent, setForm1Core, type, form1Data } = useModel('useProcessDefinition')
  const [processType, setProcessType] = useState()
  const [processType2, setProcessType2] = useState()

  useEffect(async () => {
    setForm1Core(form1Core)
    const data = await ajax.get(sysDicPath.getDicVL, { flag: '流程分类' })
    data && setProcessType(data)
    const data2 = await ajax.get(sysDicPath.getDicVL, { flag: '流程分类2' })
    data2 && setProcessType2(data2)
    //
    if (type === 'add') {
      form1Core.reset()
      form1Core.setValues({ processNameType: '流程定义名称', haveRate: '是',status:'启用', formLayout: 2, width: '95%' })
    } else {
      form1Core.setValues(form1Data)
    }
  }, [type])

  return <Form core={form1Core} layout={{ label: 10, control: 14 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="流程定义名称" name="processName" required><Input style={{ width: width }}/></FormItem>
    <FormItem label="流程分类" name="processType" required>
      <Select style={{ width: width }} options={processType}/>
    </FormItem>
    <FormItem label="流程分类2" name="processType2" required>
      <Select style={{ width: width }} options={processType2}/>
    </FormItem>
    <FormItem label="流程实例名称规则" name="processNameType">
      <Select
        style={{ width: width }}
        options={[
          { label: '流程定义名称', value: '流程定义名称' },
          { label: '用户名的流程定义名称', value: '用户名的流程定义名称' },
          { label: '资产名称的流程定义名称', value: '资产名称的流程定义名称' }]}/>
    </FormItem>
    <FormItem label="流程描述" name="description" required><Input style={{ width: width }}/></FormItem>
    <FormItem label="表单布局" name="formLayout">
      <Select
        style={{ width: width }}
        options={[
          { label: '一行一列', value: 1 },
          { label: '一行两列', value: 2 },
          { label: '一行三列', value: 3 },
          { label: '一行四列', value: 4 }]}/>
    </FormItem>
    <FormItem label="是否允许打分" name="haveRate">
      <Radio.Group
        options={[
          { label: '是', value: '是' },
          { label: '否', value: '否' }]}/>
    </FormItem>
    <FormItem label='角色分配' required>
      <div>
        <Item name='roleId'><Input style={{ width: width, marginRight: 5 ,display: 'none'}} disabled/></Item>
        <a onClick={() => {
          Dialog.show({
            title: '角色分配',
            footerAlign: 'label',
            locale: 'zh',
            enableValidate: true,
            width: 700,
            content: <RoleGiveForm roleId={form1Core.getValue('roleId')}/>,
            onOk: (values, hide) => {
              form1Core.setValue('roleId', values.roleIdArr.join(','))
              hide()
            }
          })
        }} style={{ fontSize: 15 }}>选择</a>
     
      </div>
    </FormItem>
    <FormItem label="状态" name="status"  defaultMinWidth={false} required>
    <Select  defaultValue="启用" 
        style={{ width:120 }}
        options={[
          { label: '启用', value:'启用'},
          { label: '停用', value: '停用' },
         ]}/>
    </FormItem>
    <FormItem>
      <Button onClick={async () => {
        const errorArr = await form1Core.validate()
        if (!errorArr) {
          if (form1Core.getValue('roleId')) {
            setCurrent(current + 1)
          } else {
            message.error('角色分配不能为空')
          }
        }
      }} type={'primary'}>下一步</Button>
    </FormItem>
  </Form>
}
