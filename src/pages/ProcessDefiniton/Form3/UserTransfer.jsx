import React, { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Checkbox, Input, Radio } from 'nowrapper/lib/antd'
import { ConfigProvider, Transfer } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { TreeTransfer as UserTreeTransfer } from '../../../components'

const core = new FormCore()

export default (props) => {
  const [roleArr, setRoleArr] = useState()
  const [roleTargetKeys, setRoleTargetKeys] = useState([])
  const [roleSelectedKeys, setRoleSelectedKeys] = useState([])

  const [userTree, setUserTree] = useState()
  const [userTargetKeys, setUserTargetKeys] = useState([])

  useEffect(async () => {
    setRoleArr(props.roleArr)
    setUserTree(props.userTree)
    const { operatorType, operatorTypeValue, haveStarterDept } = props.core.getValues()
    if (operatorType) {
    //20220522 checkbox似乎有“记忆”（详见日志），所以得手动赋值空值（空数组）
      !haveStarterDept && core.setValue('haveStarterDept',[''])
      haveStarterDept && core.setValue('haveStarterDept', haveStarterDept.split(',').map(item => item))
      core.setValue('operatorType', operatorType)
      //20220523给operatorTypeValue组件初始值
      core.setValue('operatorTypeValue', operatorTypeValue)
      if (operatorType === '角色') {
        setRoleTargetKeys(operatorTypeValue.split(',').map(item => parseInt(item)))
      } else {
        setUserTargetKeys(operatorTypeValue.split(',').map(item => 'user' + item))
      }
    } else {
      core.reset()
      core.setValue('operatorType', '角色')
    }
  }, [])

  const onChange = (nextTargetKeys, direction, moveKeys) => {
    core.setValue('operatorTypeValue', nextTargetKeys.join(','))
    setRoleTargetKeys(nextTargetKeys)
  }
  const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setRoleSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  }

  return <ConfigProvider locale={zhCN}>
    <Form core={core} layout={{ label: 4, control: 20 }}>
      <FormItem name='operatorTypeValue' label='operatorTypeValue' style={{ display: 'none' }}><Input/></FormItem>
      <FormItem
        name="operatorType"
        label="选择方式"
        onChange={e => {
          core.setValue('operatorTypeValue', '')
          if (e.target.value === '角色') {
            setUserTargetKeys([])
          } else {
            setRoleSelectedKeys([])
            setRoleTargetKeys([])
            core.setValue('haveStarterDept', [''])
          }
        }}>
        <Radio.Group
          options={[
            { label: '角色', value: '角色' },
            { label: '用户', value: '用户' },
            { label: '发起人', value: '发起人' }]}/>
      </FormItem>
     {/* todo问：values.type能获得别的类型的值吗（除了int/string）,如果是DatePicker组件，传过来的是什么类型？ */}
      <If when={values => values.operatorType === '角色'}>
        <div>
          <FormItem name='haveStarterDept'>
            <Checkbox.Group options={[{ label: '提交人部门', value: '提交人部门' }]}/>

          </FormItem>
          <div>
            {/* <FormItem name='ddd' label='穿梭框所在item'  > 获取不了值 */}
              <div>
                <Transfer
                  dataSource={roleArr}
                  titles={['待选角色', '已有角色']}
                  targetKeys={roleTargetKeys}
                  selectedKeys={roleSelectedKeys}
                  onChange={onChange}
                  onSelectChange={onSelectChange}
                  render={item => item.title}
                  showSelectAll={false}
                />
              </div>
        
          </div>
        </div>
      </If>
      <If when={values => values.operatorType === '用户'}>
        <div>
          <FormItem>
            <div style={{ width: 500 }}>
              <UserTreeTransfer
                dataSource={userTree}
                targetKeys={userTargetKeys}
                onChange={keys => {
                  let tmp = []
                  keys.forEach(key => {
                    if (key.indexOf('user') === 0) {
                      tmp.push(key)
                    }
                  })
                  core.setValue('operatorTypeValue', tmp.join(','))
                  setUserTargetKeys(tmp)
                }}
              />
            </div>
          </FormItem>
        </div>
      </If>
      <If when={values => values.operatorType === '发起人'}>
        {/* //20211207 */}
        <div/>
        </If>
    </Form>
  </ConfigProvider>
}
