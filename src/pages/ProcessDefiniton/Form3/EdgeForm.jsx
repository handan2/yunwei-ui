import Form, { FormCore, FormItem } from 'noform'
import { Input, Radio, Select } from 'nowrapper/lib/antd'
import { useEffect, useState } from 'react'
import { Divider } from 'antd'

export default (props) => {
  console.log('20220707')
  console.log(props.map)
  const [changeColumnNameArr, setChangeColumnNameArr] = useState()
  useEffect(() => {
    core.setValue('varNameFormItem', core.getValue('varName'))//20220708 可以问下张强，如何让select组件只显示option有的东东，而不是现在这样没有的也能显示在输入框中
    core.setValue('varNameCustom', core.getValue('varName'))
    let changeColumnZhNameArr = []
    props.map.forEach((value, key) => {
      console.log(key); console.log(value)
      if (key != 'index' && key != 'group' && key != 'fisrtData') {

        value.map(item => {
          Object.keys(item).forEach((propertyName) => {
            let tmp = {}
            if (propertyName === 'flag') {
              if (item[propertyName] === '字段变更类型') {
                let [tableZhName, columnZhName] = item['label'].split('.')
                tmp.label = columnZhName
                tmp.value = columnZhName
                changeColumnZhNameArr.push(tmp)
                console.log('propertyName遍历')
                console.log(tmp)
              } else if (item[propertyName] === '基本类型') {

                let columnZhName = item['label']
                tmp.label = columnZhName
                tmp.value = columnZhName
                changeColumnZhNameArr.push(tmp)
              }
            }


          })
        })
      }
    })
    setChangeColumnNameArr(changeColumnZhNameArr)

  }, [])







  const [isVarNameFormItem, setIsVarNameFormItem] = useState(false)
  const [core] = useState(new FormCore({
    validateConfig: {
      edgeDirection: { type: 'string', required: true, message: '连线方向不能为空' },
      edgeName: { type: 'string', required: true, message: '连线名称不能为空' }
    }
  }))
  if (props.data) {
    console.log('comeInto props.data')
    core.setValues(props.data)

  } else {
    console.log('20220707走进了估计是新画线的分支')
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
        {/* 20220707注意研究这个隐藏input怎么设置不能为空提醒  todo */}
        <FormItem label="Java变量名称" name="varNameType" defaultValue='自定义' required
          onChange={(event) => {
            if (event.target.value === '表单项名称') {
              setIsVarNameFormItem(true)
              core.setValue('varNameFormItem', null)
              core.setValue('varNameCustom', null)

            }

            else {
              core.setValue('varNameFormItem', null)
              core.setValue('varNameCustom', null)
              setIsVarNameFormItem(false)
            }


          }}>
          <Radio.Group
            options={[
              { label: '自定义', value: '自定义' },
              { label: '表单项名称', value: '表单项名称' }]} />
        </FormItem>
        <FormItem name="varNameCustom" required style={{ display: isVarNameFormItem ? 'none' : 'block' }}
          onChange={(event) => {
            if (core.getValue('varNameType') === '自定义') {
              console.log('varNameCustom onchange');
              console.log(event);
              core.setValue('varName', core.getValue('varNameCustom'))
            } else {

            }
          }}

        >
          <Input />
        </FormItem>
        <FormItem name="varNameFormItem" style={{ display: isVarNameFormItem ? 'block' : 'none' }}
          onChange={(value) => {
            if (core.getValue('varNameType') === '表单项名称') {
              console.log('varNameFormItem onchange');
              core.setValue('varName', value)
              console.log(value);
            } else {

            }
          }}>
          <Select
            options={changeColumnNameArr} />
        </FormItem>
        <FormItem name="varName" ><Input disabled /></FormItem>
        <FormItem label="判断条件" name="conditionn"
          validateConfig={{ type: 'string', message: '判断条件不能为空' }}>
          <Input /></FormItem>
      </>
    } else {
      core.setStatus('edgeDirection', 'edit')
      return <><FormItem label="按钮名称" name="buttonName" required
        validateConfig={{ type: 'string', required: true, message: '按钮名称不能为空' }}>
        <Input />
      </FormItem>
        {/* 20220624暂把下面的都加到普通连线属性中：暂不设置 */}
        {/* <Divider style={{ fontSize: 14, lineHeight: 0, paddingTop: 20 }}>以下为高级设置</Divider>
        <FormItem label="Java变量名称" name="varName" 
          validateConfig={{ type: 'string'}}>
          <Input  placeholder='中英文逗号分隔'/>
        </FormItem>
        <FormItem label="判断条件" name="conditionn" 
          validateConfig={{ type: 'string' }}>
          <Input /></FormItem> */}
      </>
    }
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input /></FormItem>
    <FormItem name="edgeId" style={{ display: 'none' }} label="edgeId"><Input /></FormItem>
    <FormItem name="sourceId" style={{ display: 'none' }} label="sourceId"><Input /></FormItem>
    <FormItem name="targetId" style={{ display: 'none' }} label="targetId"><Input /></FormItem>
    <FormItem label="连线方向" name="edgeDirection" required>
      <Radio.Group
        options={[
          { label: '退回', value: '退回' },
          { label: '提交', value: '提交' }]} />
    </FormItem>
    <FormItem label="连线名称" name="edgeName" required><Input /></FormItem>
    {renderItem()}
  </Form>
}
