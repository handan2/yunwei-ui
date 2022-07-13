import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { AutoComplete, Input, Radio,Select } from 'nowrapper/lib/antd'
import { Tree } from 'antd'
import {
  ajax,
  asTypePath,
} from '../../utils';

export default (props) => {
  console.log('20220711')
  console.log(props)
  
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
  const [asTypeLVOptions, setAsTypeLVOOptions] = useState()

  useEffect(async () => {

    //core.reset()
    core.setValue('committerType', '给本人申请')

    const asTypeLV = await ajax.get(
      asTypePath.getLevelTwoAsTypeLV
    );
    if (asTypeLV) setAsTypeLVOOptions(asTypeLV)


  }, [props])

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="committerIdStr" style={{ display: 'none' }}><Input /></FormItem>
    <FormItem label="选择类型" name="committerType">
      <Radio.Group
        options={[
          { label: '给本人申请', value: '给本人申请' },
          { label: '代其他人申请', value: '代其他人申请' }]} />
    </FormItem>
    <If when={(values) => values.committerType === '代其他人申请'}>
      <div style={{ marginLeft: 150 }}>
        <FormItem
          defaultMinWidth={false}
          name='committerName'
          validateConfig={{ type: 'string', required: true, message: '责任人不能为空' }}
          onChange={(value) => {//20220704 这个value是autoComplete输入框实际填的内容:而不是其"value"
            console.log('20220704')
            console.log(value)
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
          onSelect={(value, option) => {//20220704 这里的value区别于onChange里的value:是autoCompele下拉菜单项的"value"
            core.setValue('committerName', option.props.children.split('.')[0])// // option.props.children:选中的项目的value,虽然这里是单选，但这个属性名暂不研；option.key是label值          
            core.setValue('committerIdStr', value)//格式：user.getId() + "." + user.getDisplayName() + "." + deptMap.get(user.getDeptId())（部门名称）+ "." +user.getSecretDegree()
          }}
        >
          <AutoComplete options={options} placeholder={'模糊查询'} style={{ width: 150 }} />
        </FormItem>
      </div>
    </If>
    <FormItem name="checkGroupIdArr" style={{ display: 'none' }}><Input /></FormItem>
    {
      props.groupTreeForSelect?.length > 0 && <FormItem label={'选择类别'}>
        <Tree
          treeData={props.groupTreeForSelect}
          checkedKeys={checkedKeys}
          checkable
          defaultExpandAll
          onCheck={onCheck}
        />
      </FormItem>
    }
    {  
      props.record.integrationMode === '代理流程' && <FormItem label='选择设备类型:' defaultValue = '计算机' >
      <Select 
          options={asTypeLVOptions} />
      </FormItem>
    }
  </Form>
}
