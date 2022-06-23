import Form, { FormCore, FormItem } from 'noform'
import { Input, Radio } from 'nowrapper/lib/antd'
import { useState } from 'react'

export default (props) => {
  const [core] = useState(new FormCore({
    validateConfig: {
      edgeDirection: { type: 'string', required: true, message: '连线方向不能为空' },
      edgeName: { type: 'string', required: true, message: '连线名称不能为空' }
    }
  }))
  if (props.data) {
    core.setValues(props.data)
  } else {
    core.reset()
    core.setValues({
      edgeId: props.edge.id,
      sourceId: props.edge.sourceNodeId,
      targetId: props.edge.targetNodeId,
      edgeDirection: '提交'
    })
  }

  const renderItem = () => {
    if (props.edge.sourceNodeId.indexOf('ExclusiveGateway') === 0) {
      core.setStatus('edgeDirection', 'disabled')
      return <>
        <FormItem label="Java变量名称" name="varName" help='中英文逗号分隔' required
                  validateConfig={{ type: 'string', required: true, message: 'Java变量名称不能为空' }}>
          <Input/>
        </FormItem>
        <FormItem label="判断条件" name="conditionn" required
                  validateConfig={{ type: 'string', required: true, message: '判断条件不能为空' }}>
          <Input/></FormItem>
      </>
    } else {
      core.setStatus('edgeDirection', 'edit')
      return <FormItem label="按钮名称" name="buttonName" required
                       validateConfig={{ type: 'string', required: true, message: '按钮名称不能为空' }}>
        <Input/>
      </FormItem>
    }
  }

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name="edgeId" style={{ display: 'none' }} label="edgeId"><Input/></FormItem>
    <FormItem name="sourceId" style={{ display: 'none' }} label="sourceId"><Input/></FormItem>
    <FormItem name="targetId"  style={{ display: 'none' }} label="targetId"><Input/></FormItem>
    <FormItem label="连线方向" name="edgeDirection" required>
      <Radio.Group
        options={[
          { label: '退回', value: '退回' },
          { label: '提交', value: '提交' }]}/>
    </FormItem>
    <FormItem label="连线名称" name="edgeName" required><Input/></FormItem>
    {renderItem()}
  </Form>
}
