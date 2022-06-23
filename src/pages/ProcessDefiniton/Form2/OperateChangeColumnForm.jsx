import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Input, Radio, Select, TreeSelect } from 'nowrapper/lib/antd'
import { Modal } from 'antd';

const width = 300

export default (props) => {
  const { operateType, record, treeData } = props

  const [core] = useState(new FormCore({
    validateConfig: {
      type: { type: 'string', required: true, message: '字段类型不能为空' },
      label: { type: 'string', required: true, message: '字段名称不能为空' },
      value: { type: 'string', required: true, message: '选项内容不能为空' }
    }
  }))

  const [selectOptions, setSelectOptions] = useState()

  useEffect(async () => {
    if (operateType === 'edit') {
      core.setValues(record)
      if (record.name.split(',')[1] === '字符串') {
        setSelectOptions(['文本框', '单选按钮', '复选框', '下拉单选不可编辑', '下拉单选可编辑'].map(item => ({ label: item, value: item })))
      } else if (record.name.split(',')[1] === '数字') {
        setSelectOptions(['数字框', '单选按钮', '下拉单选不可编辑', '下拉单选可编辑'].map(item => ({ label: item, value: item })))
      } else {
        //日期、日期时间
        core.setStatus('type', 'disabled')
      }
    }
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name='index' label='索引' style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name='flag' label='数据类型标志' style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name='name' style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name='label' label='字段名称' required>
      <TreeSelect
        style={{ width: width }}
        treeData={treeData}
        treeDefaultExpandAll
        onSelect={(value, node) => {
          if (node.props.title === node.props.value) {
            Modal.warning({
              title: '提示',
              content: <div><b style={{ color: 'red' }}>{node.props.title}</b>根节点，不能被选择</div>,
              closable: true
            })
            return
          }
          //
          core.setValue('type', null)
          core.setStatus('type', 'edit')
          core.setValue('name', node.props.eventKey)
          if (node.props.eventKey.split(',')[1] === '字符串') {
            setSelectOptions(['文本框', '单选按钮', '复选框', '下拉单选不可编辑', '下拉单选可编辑'].map(item => ({ label: item, value: item })))
          } else if (node.props.eventKey.split(',')[1] === '数字') {
            setSelectOptions(['数字框', '单选按钮', '下拉单选不可编辑', '下拉单选可编辑'].map(item => ({ label: item, value: item })))
          } else {
            //日期、日期时间
            core.setValue('type', node.props.eventKey.split(',')[1])
            core.setStatus('type', 'disabled')
          }
        }}
      />
    </FormItem>
    <FormItem name='type' label={'字段类型'} required>
      <Select
        style={{ width: width }}
        options={selectOptions}
      />
    </FormItem>
    <If
      when={(values) => values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑'}>
      <FormItem name='value' label='选项内容' help='中英文逗号分隔' required><Input style={{ width: width }}/></FormItem>
    </If>
    <If
      when={(values) => values.type === '文本框' || values.type === '数字框' || values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑' || values.type === '日期' || values.type === '日期时间'}>
      <>
        <FormItem name="required" label="是否必填" defaultValue='否'>
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]}/>
        </FormItem>
        <FormItem name='tooltip' label='提示'><Input style={{ width: width }}/></FormItem>
      </>
    </If>
    <If
      when={(values) => values.type === '文本框' || values.type === '数字框' || values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑'}>
      <FormItem name='defaultValue' label='默认值'><Input style={{ width: width }}/></FormItem>
    </If>
  </Form>
}
