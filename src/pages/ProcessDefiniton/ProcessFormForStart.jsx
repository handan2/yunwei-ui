

import React, { useEffect, useState } from 'react';
import { Card, Col, message, Row, Modal, Table, ConfigProvider, Button } from 'antd';
import Form, { FormCore, FormItem, Item } from 'noform';
import { Dialog, Input, InputNumber, Radio } from 'nowrapper/lib/antd';
const { Group: RadioGroup } = Radio;
import { history } from 'umi'
import { TableRepeater, Selectify, ActionButton } from 'nowrapper/lib/antd/repeater';
import moment from 'moment'
import zhCN from 'antd/es/locale/zh_CN'
const SelectTableRepeater = Selectify(TableRepeater);

import {
  ajax,
  processFormTemplatePath,
  sysDeptPath,
  sysRolePath,
  sysUserPath,
  width,
  asTypePath,
  formItemAutoComplete,
  session,
  asDeviceCommonPath
} from '../../utils';
import getFormItem from './getFormItem';
import AsDeviceCommonQuery from './AsDeviceCommonQuery';
import _ from 'lodash';
import CheckUserTransfer from './CheckUserTransfer';
import { renderFormItem, renderHaveNextUser, handelHideChangeColumnForAff,renderAbnormalFormItem } from './renderFormItem';

let labelIdMapForItem = new Map() //20220721 <'接入外设':'5'> '5'代表组件的name属性,由表单遍历渲染时插入数据
export default (props) => {
  console.log('process start 渲染了hasChangeDisk的值：')
  console.log(hasChangeDisk)

  const [core] = useState(new FormCore());
  //表类型中资产设备真实的数据 <自定义表id,as_id>
  const [assetMap, setAssetMap] = useState(new Map());
  const [roleArr, setRoleArr] = useState();
  const [userTree, setUserTree] = useState();
  const [hasChangeDisk, setHasChangeDisk] = useState(false);
  const [repeaterModify, setRepeaterModify] = useState(false); //20220616加
  // const [diskStateOptions, setDiskStateOptions] = useState([{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }, { label: '填错', value: '填错' }])//
  // const [assetForComputerForDiskChang, setAssetForComputer] = useState({});//todo问，啥时初始值必须设？
  // const [rowTable1, setRowTable1] = useState(false);
  const { connectTypeForAff, netTypeForAff, assetTypeIdForAff } = props//20220723 这几个都是外设申领专用，单列一下，并且setValue下，以便在checkForm中使用

  useEffect(async () => {
    if (
      props.startProcessConditionVO &&
      props.startProcessConditionVO.haveNextUser === '是'
    ) {
      const data1 = await ajax.get(sysRolePath.getRoleKT);
      data1 && setRoleArr(data1);
      const data2 = await ajax.get(sysDeptPath.getDeptUserTree);
      data2 && setUserTree(data2);
    }


    core.setProps({//20220613
      repeater: { asyncHandler },
    })
    core.setValues('diskChangeDecNotForChangeComlumn', '')
    core.setValues({connectTypeForAff,netTypeForAff,assetTypeIdForAff})//用于记录在formItem:传给checkForm
    if (props.record.processName.indexOf('申领') != -1) {
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
    } else {
      if (props.formTree) {//20220715  
        console.log('20220728 22222222222222222222222222 formTree')
        console.log( props.formTree)
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



  const asyncHandler = {//20220721todo问张强，这种对象（没有构造函数）怎么封装到别处？
    add: async (values) => {//20220617这里不能访问useState，下面那个afterSetting可以
      // await sleep(1); //20220613一加这句点“确定”就不动了，不管sleep多久都是：暂不深研
      console.log('add 一开始 core.getValues()')
      console.log(core.getValues())
      //abc = false;//20220619两个问题：1.这个函数是在点保存后执行；2.这个全局变量改了不触发监控他的useEffect
      let assetForComputerForDiskChang = core.getValues().assetForComputerForDiskChang
      console.log(assetForComputerForDiskChang)
      // core.setValues({repeater:{dataSource:[{label:'aa',value:'aa'}]}})
      return ({
        success: true,
        item: {
          madeDate: moment().format('YYYY-MM-DD'),
          // userName: assetForComputerForDiskChang.userName,
          //  userDept: assetForComputerForDiskChang.userDept,
          miji: assetForComputerForDiskChang.miji,
          //  userMiji: assetForComputerForDiskChang.userMiji,
          hostAsId: assetForComputerForDiskChang.id,
          hostAsNo: assetForComputerForDiskChang.no,
          state: '在用',
          //    typeId: 25,//给他固产分类ID：其他类型（注意是一级分类）
          name: '硬盘',
          //   flag: '新增',
          netType: assetForComputerForDiskChang.netType,
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



  return (
    <ConfigProvider locale={zhCN}>
      <Form core={core} layout={{ label: 8, control: 16 }}>
        <FormItem name="asset" style={{ display: 'none' }}>
          <Input />
        </FormItem>
        {renderAbnormalFormItem(repeaterModify,props.record.processName)}
        {/* rops.connectTypeForAff可能为null  ,下面那个?的设置有时间再观察与总结 */}
        {renderFormItem(props.changeColumnLabelIdMap,props.userInfo, props.assetTypeIdForAff,props.connectTypeForAff,props.startProcessConditionVO?.hideGroupLabel,props.formTree, 1, props.record.formLayout,props.selectGroupIdArr, props.record.processName, props.tableTypeVO, core, hasChangeDisk, repeaterModify,setRepeaterModify, labelIdMapForItem, props.record.id,props.startProcessConditionVO.haveSelectAsset,assetMap,setAssetMap,false)}
        {renderHaveNextUser(props.startProcessConditionVO?.haveNextUser, props.record.formLayout, roleArr, userTree, core)}
      </Form>
    </ConfigProvider>
  );
};

