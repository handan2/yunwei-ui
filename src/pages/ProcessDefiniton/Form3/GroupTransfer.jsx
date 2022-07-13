import React, { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Checkbox, Input, Radio } from 'nowrapper/lib/antd'
import { ConfigProvider, Transfer } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

const core = new FormCore()

export default (props) => {

  const [targetKeys, setTargetKeys] = useState([])//Transfer/targetKeys && dataSource 不能为null
  useEffect(async () => {
    const { hideGroupIds,hideGroupLabel } = props.core.getValues()
    hideGroupIds && setTargetKeys (hideGroupIds.split(',').map(item => parseInt(item)))
    core.setValue('hideGroupIds', hideGroupIds) 
    core.setValue('hideGroupLabel',hideGroupLabel) 

  }, [])


  return <ConfigProvider locale={zhCN}>
    <Form core={core} layout={{ label: 4, control: 20 }}>
      <FormItem name='hideGroupIds' label='hideGroupIds' style={{ display: 'none' }}><Input /></FormItem>
      <FormItem name='hideGroupLabel' label='hideGroupLabel' style={{ display: 'none' }}><Input /></FormItem>
      {/* todo问：values.type能获得别的类型的值吗（除了int/string）,如果是DatePicker组件，传过来的是什么类型？ */}
      <div>
        <FormItem>
          <div style={{ width: 500 }}>
            <Transfer
              dataSource={props.groupTree}
              targetKeys={targetKeys}
              render={item => item.title}
              titles={['可见表单内容', '隐藏表单内容']}
              onChange={keys => {
                let tmp = []
                props.groupTree?.forEach(item=>{
                  if(keys.includes(item.key))
                  tmp.push(item.title)
                })
                core.setValue('hideGroupLabel',  tmp.join(','))
                core.setValue('hideGroupIds',  keys.join(','))
                setTargetKeys(keys)
              }}
            />
          </div>
        </FormItem>
      </div>
    </Form>
  </ConfigProvider>
}
