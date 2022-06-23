import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { AutoComplete, Input, Radio } from 'nowrapper/lib/antd'
import { Tree } from 'antd'

export default (props) => {
  const [core] = useState(new FormCore())
  const [checkedKeys, setCheckedKeys] = useState()

  const onCheck = (checkedKeys) => {
    setCheckedKeys(checkedKeys)
    if (checkedKeys.length > 0) {
      core.setValue('checkGroupIdArr', checkedKeys.map(item => parseInt(item)))
    } else {
      core.setValue('checkGroupIdArr', null)
    }
  }

  const [options, setOptions] = useState([])

  useEffect(() => {
    core.reset()
    core.setValue('committerType', '给本人申请')
  }, [props])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="committerIdStr" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem label="选择类型" name="committerType">
      <Radio.Group
        options={[
          { label: '给本人申请', value: '给本人申请' },
          { label: '代其他人申请', value: '代其他人申请' }]}/>
    </FormItem>
    <If when={(values) => values.committerType === '代其他人申请'}>
      <div style={{ marginLeft: 150 }}>
        <FormItem
          defaultMinWidth={false}
          name='committerName'
          validateConfig={{ type: 'string', required: true, message: '责任人不能为空' }}
          onChange={(value) => {
            if (value) {
              let tmp = []
              //过滤含有AutoComplete里输入的词语的userVL，并动态更新整个options
              props.userVL.forEach(item => {
                if (item.label.indexOf(value) >= 0) {
                  tmp.push(item)
                }
              })
              setOptions(tmp)
            } else {
              setOptions([])
            }
          }}
          onSelect={(value, option) => {//option里已经包含了value值，不深研
            core.setValue('committerName', option.props.children.split('.')[0])// // option.props.children:选中的项目的value,虽然这里是单选，但这个属性名暂不研；option.key是label值          
            core.setValue('committerIdStr', value)//格式：user.getId() + "." + user.getDisplayName() + "." + deptMap.get(user.getDeptId())（部门名称）+ "." +user.getSecretDegree()
          }}              //跟进个这个committerIdStr有啥用（注：如果用户只是手写没有选择 ，这个变量里是没有值的）？分析了下后台，就没有搜到committerIdStr这个字符串
        >
          <AutoComplete options={options} placeholder={'模糊查询'} style={{ width: 150 }}/>
        </FormItem>
      </div>
    </If>
    <FormItem name="checkGroupIdArr" style={{ display: 'none' }}><Input/></FormItem>
    {
      props.groupTree.length > 0 && <FormItem label={'选择类别'}>
        <Tree
          treeData={props.groupTree}
          checkedKeys={checkedKeys}
          checkable
          defaultExpandAll
          onCheck={onCheck}
        />
      </FormItem>
    }
  </Form>
}
