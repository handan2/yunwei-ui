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
  formItemAutoComplete
} from '../../utils';
import getFormItem from './getFormItem';
import AsDeviceCommonQuery from './AsDeviceCommonQuery';
import _ from 'lodash';
import CheckUserTransfer from './CheckUserTransfer';


//p20220715这个逻辑有问题
let hasChangeDisk = false;//20220618 文件中的这个变量生命周期：直到浏览器URL重新刷新：只是把原页面在界面上关闭不会消亡
export default (props) => {
  console.log('process start 渲染了hasChangeDisk的值：')
  console.log(hasChangeDisk)
  const [core] = useState(new FormCore());
  //表类型中资产设备真实的数据 <自定义表id,as_id>
  const [assetMap, setAssetMap] = useState(new Map());
  const [assetParam, setAssetParam] = useState();
  const [roleArr, setRoleArr] = useState();
  const [userTree, setUserTree] = useState();
  //const [hasChangeDisk, setHasChangeDisk] = useState(false);//20220617 变为true的条件：变更字段里有“硬盘” && 资产已选择
  const [repeaterModify, setRepeaterModify] = useState(false); //20220616加
  const [diskStateOptions, setDiskStateOptions] = useState([{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }, { label: '填错', value: '填错' }])//
  // const [assetForComputer, setAssetForComputer] = useState({});//todo问，啥时初始值必须设？
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
    const data3 = await ajax.get(asTypePath.getAsTypeIdByName, {
      name: props.record.processType2,
    }); //20211110
    data3 && setAssetParam({ typeId: data3 });
    //20211205 部分表单项（如用户相关信息）添加
    formItemAutoComplete(props.changeColumnIdLableMap, core, props.userInfo)

    /*
     通过obj['计算机信息表.用户姓名'（template/label字段）]查找changeColumnIdLableMap到对应的value就是控件中的name值,放在一个变量id中，再通过  core.setValue(id, xxxxx)来改变其值，但如果这个字段对应控件是一个select.怎么动态给这个select设置数据源呢，先得到找渲染出select字段的那个组件形式是啥，以及组件的名字是怎么命名的，todo断点
     可能需要在渲染变更字段的getFormItem.jsx里也要判断比如是用户变更的字段（定义时就设置成select），这时给把一个用户查询结果的useState(传给这个getFormItem.jsx)设置到select的option属性值中
     * 
     */
    core.setProps({//20220613
      repeater: { asyncHandler }
    })
    core.setValues('diskChangeDec', '')
    if (props.tableTypeVO) {//20220715  
      let str = JSON.stringify(props.tableTypeVO)
      if (str.indexOf('硬盘变更') != -1) //这里对表单字段命名加了约定
        hasChangeDisk = true
      else
        hasChangeDisk = false
    }
  }, []);


  const renderView = (_, ctx) => {
    const dataSource = ctx.getDataSource();
    const coreList = ctx.getCoreList();
    console.log('renderView')

    console.log(ctx)   //20220619下面这个width:'180%'很“别致”;borderedi不起作用，Demo中bordered设不设都是无框：待后续问&研
    return <Table dataSource={dataSource} style={{ width: '180%' }} size='small' pagination={false} bordered={false} rowSelection={{ type: 'radio' }} >

      <Table.Column title="序列号" dataIndex="sn" />
      <Table.Column title="型号" dataIndex="model" />
      <Table.Column title="容量(GB)" dataIndex="price" />
      <Table.Column title="密级" dataIndex="miji" />
      <Table.Column title="状态" dataIndex="state" />
      {repeaterModify && <Table.Column title="变更类型" dataIndex="flag" style={{ color: 'red' }} render={(value, record) => {
        return value ? <span style={{ color: 'red' }}>{value}</span> : <span>---</span>;
      }} />}
      <Table.Column title="操作" render={(value, record, index) => {
        return repeaterModify ? <div>
          <ActionButton core={coreList[index]} type="update"><Button size="small">编辑</Button></ActionButton>
          {/* <ActionButton core={coreList[index]} type="delete"><Button size="small">Remove</Button></ActionButton> */}
        </div> : <>---</>;
      }} />
    </Table>
  }

  const asyncHandler = {//
    add: async (values) => {//20220617这里不能访问useState，下面那个afterSetting可以
      // await sleep(1); //20220613一加这句点“确定”就不动了，不管sleep多久都是：暂不深研
      console.log('add 一开始 core.getValues()')
      console.log(core.getValues())
      //abc = false;//20220619两个问题：1.这个函数是在点保存后执行；2.这个全局变量改了不触发监控他的useEffect
      let assetForComputer = core.getValues().assetForComputer
      console.log(assetForComputer)
      // core.setValues({repeater:{dataSource:[{label:'aa',value:'aa'}]}})
      return ({
        success: true,
        item: {
          madeDate: moment().format('YYYY-MM-DD'),
          // userName: assetForComputer.userName,
          //  userDept: assetForComputer.userDept,
          miji: assetForComputer.miji,
          //  userMiji: assetForComputer.userMiji,
          hostAsId: assetForComputer.id,
          hostAsNo: assetForComputer.no,
          state: '在用',
          //    typeId: 25,//给他固产分类ID：其他类型（注意是一级分类）
          name: '硬盘',
          //   flag: '新增',
          netType: assetForComputer.netType,
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
      let diskChangeDec = core.getValues().diskChangeDec
      if (event.type === 'add') {
        let index = event.index;
        values[index].flag = '新增'
        valuesForHis.push(values[index])
        valuesForHisNew = valuesForHis
        //core.setValues('repeater', { dataSource[index]:{flag,'' }})//20220619 问题：不知道用core怎么(根据”变量形式“的index)给数组的某个成员赋值
        core.setValues('diskChangeDec', '新增硬盘（序列号:' + values[index].sn + ')；' + diskChangeDec)
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
                core.setValues('diskChangeDec', '原硬盘（序列号:' + values[index].sn + ')状态由“在用”标记为“' + values[index].state + '”;' + diskChangeDec)
              else {
                let modifyContent = ''
                if (item.model != values[index].model) {
                  modifyContent = modifyContent + '硬盘型号由“' + item.model + '”变为“' + values[index].model + '”'
                }
                if (item.price != values[index].price)
                  modifyContent = modifyContent + '硬盘容量由“' + item.price + '”变为“' + values[index].price + '”'
                core.setValues('diskChangeDec', '修改硬盘（序列号:' + values[index].sn + ')信息:' + modifyContent + '；' + diskChangeDec)
              }
              item = values[index]
              item.flag = '修改'
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
  const selectAsset = async (item) => {

    Dialog.show({
      title: '选择资产',
      footerAlign: 'label',
      locale: 'zh',
      enableValidate: true,
      width: 800,
      content: <AsDeviceCommonQuery params={assetParam} />,
      onOk: async (values, hide) => {
        if (!values.asDeviceCommonId) {
          message.error('选择一个资产');
          return;
        }
        console.log('选择完资产')
        console.log(values)
        core.setValues('assetForComputer', values.asDeviceCommon)
        const customTableId = parseInt(item.name.split('.')[0]);
        const data = await ajax.get(
          processFormTemplatePath.getTableTypeInstData,//获取资产号对应的自定义表中的相应字段值数据
          {
            customTableId: customTableId,
            asDeviceCommonId: values.asDeviceCommonId,
            processDefinitionId: props.record.id,
          },
        );
        if (data) {
          core.setValues(data.map);
          core.setValues('repeater', { dataSource: data.diskList })
          core.setValues('diskListForHisForProcess', data.diskList)
          // console.log('选择资产后')
          //  console.log(core.getValues().diskListForHisForProcess)
          if (hasChangeDisk)//数据加载了，那个hasADD等状态开关才能放开
            setRepeaterModify(true)
          let tmpMap = _.cloneDeep(assetMap);
          tmpMap.set(customTableId, values.asDeviceCommonId);
          setAssetMap(tmpMap);
          //
          let assetArr = [];
          tmpMap.forEach((value, key) => {
            assetArr.push({ customTableId: key, asId: value });
          });
          core.setValue('asset', assetArr);
          hide();
        }
      },
    });
  };

  /*
    formTree:表单树
    level:字段组递归的层次，方便缩进
    colNum:一行几列
   */
  const renderFormItem = (formTree, level, colNum) => {
    let resultArr = [], tmpArr = [];
    const hideGroupLabelArr = props.startProcessConditionVO?.hideGroupLabel?.split(',')
    //props.startProcessConditionVO &&
    formTree?.forEach((item) => {
      if (item.flag === '字段组类型') {
        if (//控制可选定可视性字段组的显示,20220525要把结点信息传到这里来
          //20220526.selectGroupIdArr包括两部分：可选字段组且已选择的（对应checkGroupIdArr）&&不可选字段组
          props.selectGroupIdArr &&
          _.indexOf(props.selectGroupIdArr, item.id) >= 0
          && _.indexOf(hideGroupLabelArr, item.label) < 0
        ) {
          resultArr.push(
            <Row
              style={{
                border: '1px solid #f0f0f0',
                background: '#f0f0f0',
                marginTop: -10,
                marginLeft: (level - 1) * 100,
                marginRight: (level - 1) * 100,
                //仅仅是隐藏时，必填项还是会判断
                //   display:_.indexOf(hideGroupLabelArr,item.label)>= 0?'none':'block'
              }}
            >
              <Col span={24 / colNum}>
                <FormItem
                  label={item.label}
                  colon={false}
                  style={{ fontWeight: 'bolder' }}
                />
              </Col>
            </Row>,
          );
          resultArr.push(
            <Row
              style={{
                border: '1px solid #f0f0f0',
                paddingTop: 20,
                paddingBottom: 10,
                marginBottom: 20,
                marginLeft: (level - 1) * 100,
                marginRight: (level - 1) * 100,
                // display:_.indexOf(hideGroupLabelArr,item.label)>= 0?'none':'block'
              }}
            >
              {renderFormItem(item.children, level + 1, item.groupLayout)}
            </Row>,
          );
        }
      } else if (item.flag === '表类型') {
        resultArr.push(
          <Row
            style={{
              border: '1px solid #f0f0f0',
              background: '#f0f0f0',
              marginTop: 10,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100,
            }}
          >
            <Col span={24 / colNum}>
              <FormItem
                label={item.label}
                colon={false}
                style={{ fontWeight: 'bolder' }}
              />
            </Col>
          </Row>,
        );
        resultArr.push(
          <Row
            style={{
              border: '1px solid #f0f0f0',
              paddingTop: 20,
              marginBottom: 20,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100,
            }}
            gutter={[8, 16]}
          >
            {props.tableTypeVO &&
              props.tableTypeVO[item.type.split('.')[0]].map(
                (itemm, index, arr) => {
                  if (index === 0) {
                    return (
                      <Col span={24 / colNum}>
                        <FormItem label={itemm.label.split('.')[1]} required>
                          <div>
                            {/* <FormItem
                              name={itemm.name + 'ErrMsg'}
                              style={{ display: 'none' }}
                            >
                              <Input />
                            </FormItem> */}
                            <Item
                              name={itemm.name}
                              validateConfig={{
                                operatorType: 'string',
                                required: true,
                                message: itemm.label.split('.')[1] + '不能为空',
                              }}
                            >
                              <Input
                                disabled
                                style={{ width: width, marginRight: 5 }}
                              />
                            </Item>
                            <a
                              style={{ fontSize: 15 }}
                              onClick={() => selectAsset(itemm)}
                            >
                              选择
                            </a>
                            <Item
                              render={(values, context) => {
                                if (values[itemm.name + 'ErrMsg']) {
                                  return (
                                    <div style={{ color: 'red' }}>
                                      {values[itemm.name + 'ErrMsg']}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </div>
                        </FormItem>
                      </Col>
                    );
                  } else {
                    if (itemm.label.split('.')[1] === '硬盘信息（用于渲染）')
                      return (<>
                        <Col span={24} style={{ background: '#f0f0f0', fontWeight: 'bolder', padding: 0, margin: 0, border: '1px solid #f0f0f0' }}>
                          <FormItem layout={{ label: 4, control: 20 }} style={{ fontWeight: 'bolder' }} label={hasChangeDisk ? '硬盘变更（可选）' : '硬盘信息'}>
                          </FormItem>
                        </Col>
                        <Col span={24} style={{ padding: 0, margin: 0, }}>
                          <FormItem name="repeater" layout={{ label: 2, control: 22 }}>
                            <SelectTableRepeater style={{ width: '100%' }} width={'100%'} locale='zh' hasAdd={repeaterModify} view={renderView}>
                              <FormItem label='序列号' status={(values, core) => {
                                return (values.flag === '新增' || values.flag === undefined) ? 'edit' : 'disabled'  //刚点新增按钮弹出的界面，flag是undefined
                              }} name='sn' required validateConfig={{ type: 'string', required: true, message: '必填项' }}><Input style={{ width: '100px' }} placeholder='若实物未购置，请填“待定”' /></FormItem>
                              <FormItem label='型号' name='model' required validateConfig={{ type: 'string', required: true, message: '必填项' }}><Input style={{ width: '100px' }} placeholder='若实物未购置，请填“待定”' /></FormItem>
                              <FormItem label="容量（GB）" name="price" validateConfig={{ type: 'number', required: true, message: '必填项' }}><InputNumber style={{ width: '100px' }} placeholder='若实物未购置，请填“待定”' /></FormItem>
                              <FormItem label="密级" name="miji"><Input style={{ width: '100px' }} placeholder='自动填充' disabled /></FormItem>
                              <FormItem status={(values, core) => {
                                return values.hostAsId ? 'edit' : 'disabled'
                              }} label='状态' name='state' defaultValue='在用' ><RadioGroup style={{ width: 200 }} options={diskStateOptions} /></FormItem>
                              <FormItem label="主机ID" name="hostAsId" ><InputNumber style={{ width: '100px' }} placeholder='自动填充' disabled /></FormItem>
                            </SelectTableRepeater>
                          </FormItem>
                        </Col>
                        {/* 20220714 hasChangeDisk对下面的控制 */}
                        {hasChangeDisk && <Col span={24} >
                          <FormItem layout={{ label: 4, control: 20 }}
                            label='变更情况' name='diskChangeDec'  >
                            {/* 因在effect里初始置空串，所以不能用defaultValue*/}
                            <Input disabled style={{ width: width * 3.5, fontWeight: 'bolder', color: 'red' }} placeholder='无变更' />
                          </FormItem>
                        </Col>
                        }
                      </>
                      )
                    else
                      return (
                        <Col span={24 / colNum}>
                          <FormItem
                            label={itemm.label.split('.')[1]} name={itemm.name} >
                            <Input disabled style={{ width: width }} />
                          </FormItem>
                        </Col>
                      );
                  }
                },
              )}
          </Row>,
        );
      } else {//20220714
        if (item.label.indexOf('硬盘变更') != -1) {//不渲染
          console.log('indexOf(硬盘变更)!=-1')
          console.log(item.label)
          //setHasChangeDisk(true)//20220618  在组件创建时的渲染过程(20220714 函数组件每次渲染必经的“主执行过程”路上)，不能使用SetState:会导致一直不停渲染
          //hasChangeDisk = true;//20220714 这种方式同样有一个问题：因为变量不会引发自动渲染，在此语句执行之前的语句是获取不到这个值的
        
        } else {
          tmpArr.push(<Col span={24 / colNum}>{getFormItem(item, core)}</Col>);
          if (tmpArr.length === colNum) {
            resultArr.push(<Row gutter={[8, 16]}>{tmpArr}</Row>);
            tmpArr = [];
          }
        }
      }
    });
    if (tmpArr.length > 0) {
      resultArr.push(<Row>{tmpArr}</Row>);
    }
    return resultArr;
  };


  //是否有下一步处理人
  const renderHaveNextUser = () => {
    if (
      props.startProcessConditionVO &&
      props.startProcessConditionVO.haveNextUser === '是'
    ) {
      return (
        <div>
          <Row
            style={{
              border: '1px solid #f0f0f0',
              background: '#f0f0f0',
              marginTop: 10,
            }}
          >
            <Col span={24 / props.record.formLayout}>
              <FormItem
                label={'指定下一步处理人'}
                colon={false}
                style={{ fontWeight: 'bolder' }}
              />
            </Col>
          </Row>
          <FormItem name="operatorType" label="operatorType" style={{ display: 'none' }}>
            <Input />
          </FormItem>
          <FormItem
            name="operatorTypeValue"
            label="operatorTypeValue"
            style={{ display: 'none' }}
          >
            <Input />
          </FormItem>
          <FormItem
            name="haveStarterDept"
            label="haveStarterDept"
            style={{ display: 'none' }}
          >
            <Input />
          </FormItem>
          <Row
            style={{
              border: '1px solid #f0f0f0',
              paddingTop: 20,
              marginBottom: 20,
            }}
            gutter={[8, 16]}
          >
            <Col span={24 / props.record.formLayout}>
              <FormItem label="处理人" required>
                <div>
                  <FormItem
                    name={'typeLabelErrMsg'}
                    style={{ display: 'none' }}
                  >
                    <Input />
                  </FormItem>
                  <Item
                    name="operatorTypeLabel"
                    validateConfig={{
                      type: 'string',
                      required: true,
                      message: '处理人不能为空',
                    }}
                  >
                    <Input style={{ width: width, marginRight: 5 }} disabled />
                  </Item>
                  <a
                    onClick={() => {
                      Dialog.show({
                        title: '处理人',
                        footerAlign: 'label',
                        locale: 'zh',
                        width: 700,
                        content: (
                          <CheckUserTransfer
                            roleArr={roleArr}
                            userTree={userTree}
                          />
                        ),
                        onOk: async (values, hide) => {
                          if (values.operatorType === '角色') {
                            if (!values.operatorTypeValue) {
                              message.error('角色不能为空');
                              return;
                            }
                            const data = await ajax.get(
                              sysRolePath.getRoleNameStr,
                              {
                                idArr: values.operatorTypeValue
                                  .split(',')
                                  .map((item) => item),
                              },
                            );
                            if (data) {
                              core.setValues({
                                operatorType: values.operatorType,
                                operatorTypeLabel: data,
                                operatorTypeValue: values.operatorTypeValue,
                              });
                              if (
                                values.haveStarterDept &&
                                values.haveStarterDept.length > 0
                              ) {
                                core.setValue(
                                  'haveStarterDept',
                                  values.haveStarterDept.join(','),
                                );
                              }
                              hide();
                            }
                          } else {
                            if (!values.operatorTypeValue) {
                              message.error('用户不能为空');
                              return;
                            }
                            const data = await ajax.get(
                              sysUserPath.getNameStr,
                              {
                                idArr: values.operatorTypeValue
                                  .replaceAll('user', '')
                                  .split(',')
                                  .map((item) => item),
                              },
                            );
                            if (data) {
                              core.setValues({
                                haveStarterDept: null,
                                operatorType: values.operatorType,
                                operatorTypeLabel: data,
                                operatorTypeValue: values.operatorTypeValue.replaceAll(
                                  'user',
                                  '',
                                ),
                              });
                              hide();
                            }
                          }
                        },
                      });
                    }}
                    style={{ fontSize: 15 }}
                  >
                    选择
                  </a>
                  <Item
                    render={(values, context) => {
                      if (values['typeLabelErrMsg']) {
                        return (
                          <div style={{ color: 'red' }}>
                            {values['typeLabelErrMsg']}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </div>
              </FormItem>
            </Col>
          </Row>
        </div>
      );
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Form core={core} layout={{ label: 8, control: 16 }}>
        <FormItem name="asset" style={{ display: 'none' }}>
          <Input />
        </FormItem>
        <FormItem name="assetForComputer" style={{ display: 'none' }}>
          <Input />
        </FormItem>
        {renderFormItem(props.formTree, 1, props.record.formLayout)}
        {renderHaveNextUser()}
      </Form>
    </ConfigProvider>
  );
};
