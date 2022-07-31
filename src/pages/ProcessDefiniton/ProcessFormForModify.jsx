


import React, { useEffect, useState } from 'react'
import { Col, Row, Divider, message, Table, Tabs, Button } from 'antd'
const { TabPane } = Tabs
import Form, { FormCore, FormItem } from 'noform'
import { InputNumber, Input, Radio } from 'nowrapper/lib/antd'
const { Group: RadioGroup } = Radio;
import { formRule, width } from '../../utils'
import getFormItem from './getFormItem'
import _ from 'lodash'
import { TableRepeater, Selectify, ActionButton } from 'nowrapper/lib/antd/repeater';
import moment from 'moment'
import ProcessGraph from './ProcessGraph'
import ProcessInstanceNodeList from '../ProcessInstanceNode/List'
import { renderFormItem, renderHaveNextUser, handelHideChangeColumnForAff, renderAbnormalFormItem } from './renderFormItem';
const SelectTableRepeater = Selectify(TableRepeater);
let labelIdMapForItem = new Map() //20220721 <'接入外设':'5'> '5'代表组件的name属性
export default (props) => {
  const [core] = useState(new FormCore())
  const [repeaterModify, setRepeaterModify] = useState(false); //20220616加
  const [assetMap, setAssetMap] = useState(new Map());
  const [hasChangeDisk, setHasChangeDisk] = useState(false)//20220727改成state
  const [diskStateOptions, setDiskStateOptions] = useState([{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }, { label: '填错', value: '填错' }])//
  useEffect(() => {
    core.reset()
    //表单的日期处理
    let values = formRule.dateHandle('parse', JSON.parse(props.processFormValue1.value))
    core.setValues({ ...values, diskListForHisForProcess: props.diskListForHisForProcess })
    core.setProps({
      repeater: { asyncHandler }
    })
    if (!core.getValues().diskChangeDecNotForChangeComlumn)
      core.setValues('diskChangeDecNotForChangeComlumn', '')
    if (props.processDefinition.processName.indexOf('申领') != -1) {
      let formItemNameForHasChangeDiskNForApply = labelIdMapForItem.get('是否更换硬盘')//20220727约定计算机专用表/申请更换硬盘字段的中文名； 此字段目前仅用于申领流程
      if (formItemNameForHasChangeDiskNForApply) {
        console.log('20220727 ormItemNameForHasChangeDiskNForApply有值 ')// `共${total}条` `'${formItemNameForHasChangeDiskNForApply}'`
        if (core.getValues()[formItemNameForHasChangeDiskNForApply] === '是') {
          setHasChangeDisk(true)
          setRepeaterModify(true)
          console.log('20220727 formItemNameForHasChangeDiskNForApply] ====是', core.getValues())
        } else {
          setHasChangeDisk(false)
          setRepeaterModify(false)
        }
        let a = {}
        a[formItemNameForHasChangeDiskNForApply] = {
          onChange: (event) => {
            console.log('是否变更硬盘 radio.group 的onchange 监听')
            let obj = {}
            obj[formItemNameForHasChangeDiskNForApply] = event.target.value
            core.setValues(obj)//如果onChange是直接写在formItem里的话：这句是不用写的：原理不研
            if (event.target.value === '是') {
              setHasChangeDisk(true)
              setRepeaterModify(true)
            }
            else {
              setHasChangeDisk(false)
              setRepeaterModify(false)
            }

          }

        }
        core.setProps(a)
      }
    } else {
      if (props.formTree) {//20220715  
        let str = JSON.stringify(props.formTree)
        if (str.indexOf('硬盘变更') != -1) {//这里对表单字段命名加了约定
          console.log('2020715含 有硬盘变更字段')
          setHasChangeDisk(true)
        }
        else
          setHasChangeDisk(false)
      }
    }

  }, [])


  const asyncHandler = {//
    add: async (values) => {//20220617这里不能访问useState，下面那个afterSetting可以
      console.log('add 一开始 core.getValues()')
      console.log(props.record)
      console.log(core.getValues())
      let assetForComputerForDiskChange = core.getValues().assetForComputerForDiskChange
      console.log(assetForComputerForDiskChange)
      return ({
        success: true,
        item: {
          madeDate: moment().format('YYYY-MM-DD'),
          miji: assetForComputerForDiskChange.miji,
          hostAsId: assetForComputerForDiskChange.id,
          hostAsNo: assetForComputerForDiskChange.no,
          state: '在用',
          processInstanceDataId: props.record.id,
          name: '硬盘',
          netType: assetForComputerForDiskChange.netType,
          key: Math.random().toString(36).slice(2),//仅用于界面逻辑：区分成员
          no: 'YP' + Math.random().toString(36).slice(2)
        }
      });
    },
    afterSetting: (event, repeater) => {//20220618
      console.log(event.type);
      console.log('event', event, 'repeater', repeater);
      let values = repeater.getValues();
      let valuesForHis = core.getValues().diskListForHisForProcess;
      let valuesForHisNew
      let diskChangeDecNotForChangeComlumn = core.getValues().diskChangeDecNotForChangeComlumn|| ""
      if (event.type === 'add') {
        let index = event.index;
        values[index].flag = '新增'
        valuesForHis.push(values[index])
        valuesForHisNew = valuesForHis
        //core.setValues('repeater', { dataSource[index]:{flag,'' }})//20220619 问题：不知道用core怎么(根据”变量形式“的index)给数组的某个成员赋值
        core.setValues('diskChangeDecNotForChangeComlumn', '新增硬盘（序列号:' + values[index].sn + ')；' + diskChangeDecNotForChangeComlumn)
      }
      if (event.type === 'delete') {
        let value = event.item.value
        valuesForHisNew = valuesForHis.map(item => {
          if (item.key) {//有key即为新增的数据
            if (item.key === value.key)
              item.flag = '删除'
          }
          if (item.sn)
            if (item.sn === value.sn && item.model === value.model)//可能因重复值误删除多个，但不考虑这两值同时重复
              item.flag = '删除'
          return item
        })
      }
      if (event.type === 'update') {//有问题要修改
        let index = event.index;
        //  let value = event.item.value
        valuesForHisNew = valuesForHis.map(item => {
          console.log('item && values[index]')
          console.log(item)
          console.log(values[index])
          if (item.asId) {//有asid说明硬盘在asDeviceCommon表中已存在
            if (item.asId === values[index].asId) {

              if (values[index].state != '在用')//20220619 约定：只加载“在用”状态的硬盘信息
                core.setValues('diskChangeDecNotForChangeComlumn', '原硬盘（序列号:' + values[index].sn + ')状态由“在用”标记为“' + values[index].state + '”;' + diskChangeDecNotForChangeComlumn)
              else {
                let modifyContent = ''
                if (item.model != values[index].model) {
                  modifyContent = modifyContent + '硬盘型号由“' + item.model + '”变为“' + values[index].model + '”'
                }
                if (item.price != values[index].price)
                  modifyContent = modifyContent + '硬盘容量由“' + item.price + '”变为“' + values[index].price + '”'
                core.setValues('diskChangeDecNotForChangeComlumn', '修改硬盘（序列号:' + values[index].sn + ')信息:' + modifyContent + '；' + diskChangeDecNotForChangeComlumn)
              }
              item = values[index]
              item.flag = '修改'
              core.setValue(labelIdMapForItem.get('硬盘变更') + '', core.getValue('diskChangeDecNotForChangeComlumn'))//写入变更字段id对应的core/value中（这个value并没有对应的formITEM）

            }
          } else {
            item.model = values[index].model
            item.price = values[index].price
            item.state = values[index].state
          }
          return item
        })
      }
      console.log('afterSetting:最后部分:')
      console.log(valuesForHisNew)
      console.log(core.getValues().repeater)
      if (valuesForHisNew) {
        core.setValues('diskListForHisForProcess', valuesForHisNew)
        //20220619把Repeater也赋成his的值吧
        core.setValues('repeater', { dataSource: valuesForHisNew })
      }
      console.log(core.getValues().diskListForHisForProcess)
    }
  }


  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <Tabs animated={false}>
      <TabPane tab="表单" key="1">
        <FormItem name="asset" style={{ display: 'none' }}><Input /></FormItem>
        <FormItem name="assetForComputerForDiskChange" style={{ display: 'none' }}><Input /></FormItem>
        {renderFormItem(null,null,null,null, null, props.formTree, 1, props.processDefinition.formLayout, props.selectGroupIdArr, props.processDefinition.processName, props.tableTypeVO, core, hasChangeDisk, repeaterModify, setRepeaterModify, labelIdMapForItem, props.processDefinition.id, "否", assetMap, setAssetMap,false)}
      </TabPane>
      <TabPane tab="流程图" key="2">
        <ProcessGraph record={props.record} />
      </TabPane>
      <TabPane tab="审批记录" key="3">
        <ProcessInstanceNodeList record={props.record} />
      </TabPane>
    </Tabs>
  </Form >
}
