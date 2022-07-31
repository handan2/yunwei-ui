import { useEffect, useState } from 'react'
import { ajax, processDefinitionPath } from '../../../utils'
import Form, { FormCore, FormItem, If } from 'noform'
import { Input, Radio, Select } from 'nowrapper/lib/antd'
import { Modal } from 'antd'

const width = 300

export default (props) => {
  const { operateType, record } = props

  const [core] = useState(new FormCore({
    validateConfig: {
      type: { type: 'string', required: true, message: '字段类型不能为空' },
      label: { type: 'string', required: true, message: '字段名称不能为空' },
      value: { type: 'string', required: true, message: '选项内容不能为空' }
    }
  }))

  const [selectOptions, setSelectOptions] = useState()

  useEffect(async () => {
    const data = await ajax.get(processDefinitionPath.getTypeVL)
    data && setSelectOptions(data)
    if (operateType === 'add') {
      core.setValues({ required: '否', visible: '是' })
    } else {
      core.setValues(record)
    }
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name='index' label='索引' style={{ display: 'none' }}><Input /></FormItem>
    <FormItem name='flag' label='数据类型标志' style={{ display: 'none' }}><Input /></FormItem>
    <FormItem name='label' label='字段名称' required><Input style={{ width: width }} /></FormItem>
    <FormItem name='type' label={'字段类型'} required>
      <Select
        style={{ width: width }}
        options={selectOptions}
        onSelect={value => {
          value && value.indexOf('.') > 0 && core.setValues('label', value.split('.')[1])
          core.setValues({ required: '否' })
        }}
      />
    </FormItem>
    <If
      when={(values) => values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑'}>
      <FormItem name='value' label='选项内容' help='中英文逗号分隔' required><Input style={{ width: width }} /></FormItem>
    </If>
    <If
      when={(values) => values.type === '文本框' || values.type === '数字框' || values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑' || values.type === '日期' || values.type === '日期时间'}>
      <>
        <FormItem name="required" label="是否必填">
          <Radio.Group
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name="visible" label="界面可见" onChange={(event) => {
          if (event.target.value === '否') {
            Modal.warning({
              title: '提示',
              content: (
                <div>
                  <p style={{ fontSize: 15 }}>
                    如果设置“不可见”，那么<span style={{ fontSize: 15,fontWeight:'bold' }}>“必填项”必须设置成“否”</span>，否则提交表单会报错哦~          
                  </p>
                </div>
              ),
              okText: '确定',
              closable: true,
            });
          }
        }}>
          <Radio.Group style={{ width: 100 }}
            options={[
              { label: '是', value: '是' },
              { label: '否', value: '否' }]} />
        </FormItem>
        <FormItem name='tooltip' label='提示'><Input style={{ width: width }} /></FormItem>
      </>
    </If>
    <If
      when={(values) => values.type === '文本框' || values.type === '数字框' || values.type === '单选按钮' || values.type === '复选框' || values.type === '下拉单选不可编辑' || values.type === '下拉单选可编辑'}>
      <FormItem name='defaultValue' label='默认值'><Input style={{ width: width }} /></FormItem>
    </If>
  </Form>
}
