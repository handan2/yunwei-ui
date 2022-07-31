import React, { useEffect, useState } from 'react'
import { Col, Divider, message, Row, Table, Tabs, Button, ConfigProvider } from 'antd'
import Form, { FormCore, FormItem, Item, If } from 'noform'
import { Checkbox, Dialog, InputNumber, Select, Input, Radio } from 'nowrapper/lib/antd'
const { Group: RadioGroup } = Radio;
import { ajax, formRule, sysDeptPath, sysRolePath, sysUserPath, width, session, processFormTemplatePath, processDefinitionPath } from '../../utils'
import getFormItem from './getFormItem'
import _ from 'lodash'
import CheckUserTransfer from './CheckUserTransfer'
import ProcessGraph from './ProcessGraph'
import ProcessInstanceNodeList from '../ProcessInstanceNode/List'
import AsDeviceCommonQuery from './AsDeviceCommonQuery';
import { TableRepeater, Selectify, ActionButton } from 'nowrapper/lib/antd/repeater';
import moment from 'moment'
import zhCN from 'antd/es/locale/zh_CN'
import { renderFormItem, renderHaveNextUser, handelHideChangeColumnForAff, renderAbnormalFormItem } from './renderFormItem';
const SelectTableRepeater = Selectify(TableRepeater);

const { TabPane } = Tabs

let labelIdMapForItem = new Map() //20220721 <'接入外设':'5'> '5'代表组件的name属性； 所有变更字段的label/id对照表（空转字段也遍历了，蛤没记录到：因为空转字段的label只是一个字符串:通过item.label.split('.')[1]这种机制提取label值只能得到undefined:这会在map.set时自动过滤（key为undefined的情况））
//用于待办任务
export default (props) => {
  console.log('监测刷新：start')
  const [core] = useState(new FormCore())
  const [assetMap, setAssetMap] = useState(new Map());
  const [processSelectOptions, setProcessSelectOptions] = useState([]);
  const [repeaterModify, setRepeaterModify] = useState(false); //20220616加
  const [hasChangeDisk, setHasChangeDisk] = useState(false)//20220727改成state
  const [roleArr, setRoleArr] = useState()
  const [userTree, setUserTree] = useState()

  useEffect(async () => {
    core.reset()
    if (props.checkTaskVO && props.checkTaskVO.haveNextUser === '是') {
      const data1 = await ajax.get(sysRolePath.getRoleKT)
      data1 && setRoleArr(data1)
      const data2 = await ajax.get(sysDeptPath.getDeptUserTree)
      data2 && setUserTree(data2)
    }
    //表单的日期处理
    let values = formRule.dateHandle('parse', JSON.parse(props.processFormValue1.value))
    //20220622
    core.setValues({ ...values, diskListForHisForProcess: props.diskListForHisForProcess })
    // 是否允许修改表单
    if (props.checkTaskVO) {
      if (props.checkTaskVO.haveEditForm === '否') {
        core.setStatus('disabled')//这个把所有的可编辑关了，所以下面再把部分不需要被控制的form组件编辑性打开
        //操作记录
        if (props.checkTaskVO.haveOperate === '是') {
          core.setStatus('operate', 'edit')
        }
        //审批意见
        if (props.checkTaskVO.haveComment === '是') {
          core.setStatus('comment', 'edit')
        }
      } else //20220621
        setRepeaterModify(true)
    }
    console.log('111111111111111111')
    console.log(props.record)
    const data4 = await ajax.get(processDefinitionPath.getProcessDefLV, { processName: props.processDefinition.processName }) //20220626 record.processNAME 都换成props.processDefinition
    console.log('data4')
    console.log(data4)
    data4 && setProcessSelectOptions(data4)
    //formItemAutoComplete(props.changeColumnLabelIdMap, core, props.userInfo)
    core.setProps({//20220613
      repeater: { asyncHandler }
    })
    if (!core.getValues().diskChangeDecNotForChangeComlumn)
      core.setValues('diskChangeDecNotForChangeComlumn', '')

    // core.setProps({
    //   'test':{  //20220727 可用
    //   onChange: (event) => {
    //     console.log('是否变更硬盘 radio.group 的onchange 监听')

    //   }
    // }})
    if (props.processDefinition.processName.indexOf('申领') != -1) {
      let formItemNameForHasChangeDiskNForApply = labelIdMapForItem.get('是否更换硬盘')//20220727约定计算机专用表/申请更换硬盘字段的中文名； 此字段目前仅用于申领流程
      if (formItemNameForHasChangeDiskNForApply) {
        console.log('20220727 ormItemNameForHasChangeDiskNForApply有值 ')// `共${total}条` `'${formItemNameForHasChangeDiskNForApply}'`
        if (core.getValues()[formItemNameForHasChangeDiskNForApply] === '是') {
          setHasChangeDisk(true)
          setRepeaterModify(true)
          console.log('20220727 formItemNameForHasChangeDiskNForApply] ====是', core.getValues())
        }else{
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
            if (event.target.value === '是'){
              setHasChangeDisk(true)
              setRepeaterModify(true)
            }
            else{
              setHasChangeDisk(false)
              setRepeaterModify(false)
            }

          }

        }
        core.setProps(a)
      }
      // if(core.getValue(labelIdMapForItem.get('是否重装操作系统')) === '否'){ //20220 加validate/props死活不行（getformItem里把validate注释了，也不行，看来只能利用和“隐藏组件”去除validate一样的方式 了：不可以，这个是渲染时处理，我这是渲染后处理），只能用提交后的检验了
      //   console.log('20220727 重装：否 ')//提交后检验也有问题：不能判断当前是没填还是根本就没有渲染这个组件（因为这个组件只对三员可见）：暂把表单设计中的必填取消，后面再想怎么做吧
      //   let formItemNameForOS = labelIdMapForItem.get('操作系统安装时间')
      //   let b = {}
      //   b[formItemNameForOS] ={required:true,validateConfig: { 
      //              type: 'date',
      //     required: true,
      //     message:'不能为空',
      //     validator: (rule, value) => !!value
      //   }}
      //   console.log(b)
      //   core.setProps(b)
    
      //  }
      
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

  }, []);


  const asyncHandler = {//
    add: async (values) => {//20220617这里不能访问useState，下面那个afterSetting可以
      // await sleep(1); //20220613一加这句点“确定”就不动了，不管sleep多久都是：暂不深研
      console.log('add 一开始 core.getValues()')
      console.log(props.record)
      console.log(core.getValues())
      //abc = false;//20220619两个问题：1.这个函数是在点保存后执行；2.这个全局变量改了不触发监控他的useEffect
      let assetForComputerForDiskChange = core.getValues().assetForComputerForDiskChange
      console.log(assetForComputerForDiskChange)
      // core.setValues({repeater:{dataSource:[{label:'aa',value:'aa'}]}})
      return ({
        success: true,
        item: {
          madeDate: moment().format('YYYY-MM-DD'),
          // userName: assetForComputerForDiskChange.userName,
          //userDept: assetForComputerForDiskChange.userDept,
          miji: assetForComputerForDiskChange.miji,
          // userMiji: assetForComputerForDiskChange.userMiji,
          hostAsId: assetForComputerForDiskChange.id,
          hostAsNo: assetForComputerForDiskChange.no,
          state: '在用',
          processInstanceDataId: props.record.id,
          //   typeId: 25,//给他固产分类ID：其他类型（注意是一级分类）
          name: '硬盘',
          //   flag: '新增',
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
      let diskChangeDecNotForChangeComlumn = core.getValues().diskChangeDecNotForChangeComlumn || ""
      if (event.type === 'add') {
        let index = event.index;
        values[index].flag = '新增'
        valuesForHis.push(values[index])
        valuesForHisNew = valuesForHis
        //core.setValues('repeater', { dataSource[index]:{flag,'' }})//20220619 问题：不知道用core怎么(根据”变量形式“的index)给数组的某个成员赋值
        core.setValues('diskChangeDecNotForChangeComlumn', '新增硬盘（序列号:' + values[index].sn + ')；' + diskChangeDecNotForChangeComlumn)
        //  abc = false//20220619todo测试在这里能不能触发useEffect:不能立即，必须下面那个dialog提交完才行:必须伴随useState
        //setDiskStateOptions([{ label: '在用', value: '在用' }])//20220619测试待删除:现象待总结：这句不用等下面那个dialog的确认，直接引发渲染，连带着把上面那个Abc的监控也触发了
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

  //是否有操作记录
  const renderHaveOperate = () => {
    if (props.checkTaskVO && props.checkTaskVO.haveOperate === '是') {
      return <div>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={'操作类型'} colon={false} style={{ fontWeight: 'bolder' }} />
          </Col>
        </Row>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem width='500px' label={'操作类型'} name="operate" value={['常规检测', '其他操作']}>
              <Checkbox.Group options={props.operateArr.map(val => ({ label: val, value: val }))} />
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  //20220626加
  const renderHaveSelectProcess = () => {
    if (props.checkTaskVO && props.checkTaskVO.haveSelectProcess === '是') {
      return <div>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={'选择后续待办流程'} colon={false} style={{ fontWeight: 'bolder' }} />
          </Col>
        </Row>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label='后续流程' name='selectedProcess' >
              <Select
                placeholder='授权用户发起相关处置流程'
                style={{ width: width }}
                options={processSelectOptions} />
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  //是否有 意见/备注
  const renderHaveComment = () => {
    if (props.checkTaskVO && props.checkTaskVO.haveComment === '是') {
      return <div>
        <Divider style={{ fontSize: 14, lineHeight: 0, paddingTop: 20 }}>以下是审批或处理信息</Divider>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={props.checkTaskVO.commentTitle}
              colon={false}
              style={{ fontWeight: 'bolder' }} />
          </Col>
        </Row>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={props.checkTaskVO.commentTitle} name="comment">
              <Input.TextArea style={{ width: width }} placeholder="审批与处理者填写" />
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <Tabs animated={false}>
      <TabPane tab="表单" key="1">
        <FormItem name="asset" style={{ display: 'none' }}><Input /></FormItem>
        <FormItem name="assetForComputerForDiskChange" style={{ display: 'none' }}><Input /></FormItem>
        {renderAbnormalFormItem(repeaterModify, props.processDefinition.processName)}
        {renderFormItem(null,null,null,null, props.checkTaskVO?.hideGroupLabel, props.formTree, 1, props.processDefinition.formLayout, props.selectGroupIdArr, props.processDefinition.processName, props.tableTypeVO, core, hasChangeDisk, repeaterModify, setRepeaterModify, labelIdMapForItem, props.processDefinition.id, props.checkTaskVO.haveSelectAsset, assetMap, setAssetMap,false)}
        {renderHaveOperate()}
        {renderHaveComment()}
        {renderHaveNextUser(props.checkTaskVO?.haveNextUser, props.processDefinition.formLayout, roleArr, userTree, core)}
        {renderHaveSelectProcess()}
      </TabPane>
      <TabPane tab="流程图" key="2">
        <ProcessGraph record={props.record} />
      </TabPane>
      <TabPane tab="审批记录" key="3">
        <ProcessInstanceNodeList record={props.record} />
      </TabPane>
    </Tabs>
  </Form>
}



