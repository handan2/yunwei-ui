import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { AutoComplete, Input, Radio, Select, TreeSelect } from 'nowrapper/lib/antd'
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
  const [delegateChooseAff, setDelegateChooseAff] = useState(false)
  const [delegateAssetChooseVisbile, setDelegateAssetChooseVisbile] = useState('block')
  const [asTypeLVOptions, setAsTypeLVOOptions] = useState()//用于“代理流程”选择资产类别 
   const [assetTypeForAffOptions, setAssetTypeForAffOptions] = useState()//用于“代理流程”选择资产类别 
  useEffect(async () => {

    //core.reset()
    core.setValue('committerType', '给本人申请')
    const asTypeLV = await ajax.get(
      asTypePath.getLevelTwoInFoAssetAsTypeLV
    );
    if (asTypeLV) setAsTypeLVOOptions(asTypeLV)
    //20220717

    const data = await ajax.get(
      asTypePath.getAsTypeTree, { rootId: 6 }//20220717 6代表外设的typeId
    );
    if (data) setAssetTypeForAffOptions(data)
   // core.setValue('assetTypeForAffOptions', data)




  }, [props])

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="committerIdStr" style={{ display: 'none' }}><Input /></FormItem>

    <FormItem label="申请类型" name="committerType">
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
    {((props.record.processName.indexOf('外设声像及办公自动化申领') != -1) || delegateChooseAff) && <FormItem label="运行方式" name="connectTypeForAff" defaultValue='连接计算机'>
      <Radio.Group
        options={[
          { label: '直连网络', value: '直连网络' },
          { label: '连接计算机', value: '连接计算机' },
          { label: '独立运行', value: '独立运行' }
        ]} />
    </FormItem>
    }
    {((props.record.processName.indexOf('外设声像及办公自动化申领') != -1) || delegateChooseAff) &&
      <If when={(values) => values.connectTypeForAff === '直连网络'}>

        <FormItem
          defaultMinWidth={false}
          name='netTypeForAff'
          required
          label="选择网络类型"
          validateConfig={{ type: 'string', required: true, message: '网络类别不能为空' }}
          onChange={(value) => {//20220704 这个value是autoComplete输入框实际填的内容:而不是其"value"

          }}
          onSelect={(value, option) => {//20220704 这里的value区别于onChange里的value:是autoCompele下拉菜单项的"value"

          }}
        >
          <Radio.Group
            options={[
              { label: '内网', value: '内网' },
              { label: '商密网', value: '商密网' },
              { label: '试验网', value: '试验网' },
              { label: '互联网', value: '互联网' },
            ]} />
        </FormItem>

      </If>}
    {((props.record.processName.indexOf('外设声像及办公自动化申领') != -1) || delegateChooseAff) && <If when={(values) => values.connectTypeForAff === '连接计算机'}>
      <FormItem
        defaultMinWidth={false}
        name='assetTypeIdForAff'
        required
        help={<span style={{ opacity: '50%' }}  >可帮您加载默认计算机策略^_^</span>}
        validateConfig={[{ type: 'number', required: true, message: '请选择具体设备类型' },
        {validator(rule, value, callback, source, options) {
          console.log('20220718 外设子分类的 校验时的value')
          console.log(value)
            if(value === 6){//约定了外设主类的id
                callback(['请选择详细分类']);
            }
            callback([])
        }}]}
        label="选择详细类型"
      >
        <TreeSelect
          style={{ width: '200px' }}
          treeData={assetTypeForAffOptions}
         // treeData={core.getValue('assetTypeForAffOptions')}
          treeDefaultExpandAll
          placeholder='根据设备类型加载默认计算机策略'
          onSelect={async (value, node) => {
            // const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: value })
            // if (data) {
            //   setTypeId(data.id)
            core.setValue('assetTypeIdForAff', value)// 20220626这个赋值似乎不用写：包装他的formItem能自动获取
            //  }
          }}
        />
      </FormItem>
    </If>
    }
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
      props.record.integrationMode === '代理流程' && <FormItem name="assetType" label='选择设备类型:' defaultValue='计算机' style={{ display: delegateAssetChooseVisbile }} >
        <Select
          options={asTypeLVOptions}
          onSelect={(value, node) => {
            if (value.indexOf('外设声像及办公自动化') != -1) {
              setDelegateChooseAff(true)
              setDelegateAssetChooseVisbile('none')
              console.log('代理流程：设备选 了 ：外设声像及办公自动化')
            }

            // core.setValue('delegateProcessAssetType','外设、声像及办公自动化')

          }} />
      </FormItem>
    }
  </Form>
}
