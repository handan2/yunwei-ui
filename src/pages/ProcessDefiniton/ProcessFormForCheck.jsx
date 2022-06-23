import React, { useEffect, useState } from 'react'
import { Col, Divider, message, Row, Table, Tabs, Button } from 'antd'
import Form, { FormCore, FormItem, Item, If } from 'noform'
import { Checkbox, Dialog, InputNumber, Input, Radio } from 'nowrapper/lib/antd'
const { Group: RadioGroup } = Radio;
import { ajax, formRule, sysDeptPath, sysRolePath, sysUserPath, width, asTypePath, processFormTemplatePath } from '../../utils'
import getFormItem from './getFormItem'
import _ from 'lodash'
import CheckUserTransfer from './CheckUserTransfer'
import ProcessGraph from './ProcessGraph'
import ProcessInstanceNodeList from '../ProcessInstanceNode/List'
import AsDeviceCommonQuery from './AsDeviceCommonQuery';
import { TableRepeater, Selectify, ActionButton } from 'nowrapper/lib/antd/repeater';
import moment from 'moment'
import zhCN from 'antd/es/locale/zh_CN'
const SelectTableRepeater = Selectify(TableRepeater);

const { TabPane } = Tabs

let hasChangeDisk = false;
//用于待办任务
export default (props) => {
  const [core] = useState(new FormCore())
  const [assetMap, setAssetMap] = useState(new Map());
  const [assetParam, setAssetParam] = useState();
  const [repeaterModify, setRepeaterModify] = useState(false); //20220616加
  const [diskStateOptions, setDiskStateOptions] = useState([{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }, { label: '填错', value: '填错' }])//
  useEffect(async () => {
    core.reset()
    //表单的日期处理
    let values = formRule.dateHandle('parse', JSON.parse(props.processFormValue1.value))
    //20220622
    core.setValues({ ...values, diskListForHisForProcess: props.diskListForHisForProcess })
    // 是否允许修改表单
    if (props.checkProcessConditionVO) {
      if (props.checkProcessConditionVO.haveEditForm === '否') {
        core.setStatus('disabled')//这个把所有的可编辑关了，所以下面再把部分不需要被控制的form组件编辑性打开
        //操作记录
        if (props.checkProcessConditionVO.haveOperate === '是') {
          core.setStatus('operate', 'edit')
        }
        //审批意见
        if (props.checkProcessConditionVO.haveComment === '是') {
          core.setStatus('comment', 'edit')
        }
      } else //20220621
        setRepeaterModify(true)
    }
    console.log('111111111111111111')
    console.log(props.record)
    const data3 = await ajax.get(asTypePath.getAllowedAsTypeIdByProDefId, {
      id: props.record.processDefinitionId,//20220621 props.record此时传来是instanceData表数据：没有processType2字段
    }); //20211110

    data3 && setAssetParam({ typeId: data3 });
    //formItemAutoComplete(props.templateIdLableMap, core, props.userInfo)
    core.setProps({//20220613
      repeater: { asyncHandler }
    })
  }, []);
  const renderTableColumn = () => {
    if (repeaterModify)
    return<Table.Column title="操作" render={(value, record, index) => {
      return <div>

        <ActionButton core={coreList[index]} type="update"><Button size="small">编辑</Button></ActionButton>
        {/* <ActionButton core={coreList[index]} type="delete"><Button size="small">Remove</Button></ActionButton> */}

      </div>;
    }} />
  }
  const renderView = (_, ctx) => {
    const dataSource = ctx.getDataSource();
    const coreList = ctx.getCoreList();
    console.log('renderView')

    console.log(ctx)   //20220619下面这个width:'180%'很“别致”;borderedi不起作用，Demo中bordered设不设都是无框：待后续问&研
    return <Table dataSource={dataSource} style={{ width: '200%' }} size='small' pagination={false} bordered={false} rowSelection={{ type: 'radio' }} >

      <Table.Column title="序列号" dataIndex="sn" />
      <Table.Column title="型号" dataIndex="model" />
      <Table.Column title="容量（GB）" dataIndex="price" />
      <Table.Column title="密级" dataIndex="miji" />
      <Table.Column title="状态" dataIndex="state" />
      <Table.Column title="变更类型" dataIndex="flag" style={{ color: 'red' }} render={(value, record) => {
        return value ? <span style={{ color: 'red' }}>{value}</span> : <span>---</span>;
      }} />
    {renderTableColumn()} 
    </Table>
  }

  const asyncHandler = {//
    add: async (values) => {//20220617这里不能访问useState，下面那个afterSetting可以
      // await sleep(1); //20220613一加这句点“确定”就不动了，不管sleep多久都是：暂不深研
      console.log('add 一开始 core.getValues()')
      console.log(props.record)
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
          //userDept: assetForComputer.userDept,
          miji: assetForComputer.miji,
          // userMiji: assetForComputer.userMiji,
          hostAsId: assetForComputer.id,
          hostAsNo: assetForComputer.no,
          state: '在用',
          processInstanceDataId: props.record.id,
          //   typeId: 25,//给他固产分类ID：其他类型（注意是一级分类）
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
        core.setValues('assetForComputer', values.asDeviceCommon)
        const customTableId = parseInt(item.name.split('.')[0]);
        const data = await ajax.get(
          processFormTemplatePath.getTableTypeInstData,//获取资产号对应的自定义表中的相应字段值数据
          {
            customTableId: customTableId,
            asDeviceCommonId: values.asDeviceCommonId,
            processDefinitionId: props.record.processDefinitionId,
          },
        );

        if (data) {
          core.setValues(data.map);
          core.setValues('repeater', { dataSource: data.diskList })
          core.setValues('diskListForHisForProcess', data.diskList)
          core.setValues('diskChangeDec', '')

          //
          let tmpMap = _.cloneDeep(assetMap);
          tmpMap.set(customTableId, values.asDeviceCommonId);
          setAssetMap(tmpMap);
          //
          let assetArr = [];
          tmpMap.forEach((value, key) => {
            assetArr.push({ customTableId: key, asId: value });
          });

          core.setValue('asset', assetArr);//20220528todo问可以给item/input赋值一个数组？？？Y
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
    let resultArr = [], tmpArr = []
    const hideGroupLabelArr = props.checkProcessConditionVO?.hideGroupLabel?.split(',')//20220527
    formTree.forEach(item => {
      if (item.flag === '字段组类型') {
        if (props.selectGroupIdArr && _.indexOf(props.selectGroupIdArr, item.id) >= 0
          && _.indexOf(hideGroupLabelArr, item.label) < 0) {//20220527控制隐藏字段组加载
          resultArr.push(
            <Row style={{
              border: '1px solid #f0f0f0',
              background: '#f0f0f0',
              marginTop: -10,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100
            }}>
              <Col span={24 / colNum}>
                <FormItem label={item.label} colon={false} style={{ fontWeight: 'bolder' }} />
              </Col>
            </Row>
          )
          resultArr.push(
            <Row style={{
              border: '1px solid #f0f0f0',
              paddingTop: 20,
              paddingBottom: 10,
              marginBottom: 20,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100
            }} gutter={[8, 16]}>
              {renderFormItem(item.children, level + 1, item.groupLayout)}
            </Row>
          )
        }
      } else if (item.flag === '表类型') {
        resultArr.push(
          <Row style={{
            border: '1px solid #f0f0f0',
            background: '#f0f0f0',
            marginTop: 10,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100
          }}>
            <Col span={24 / colNum}><FormItem label={item.label} colon={false} style={{ fontWeight: 'bolder' }} /></Col>
          </Row>
        )
        resultArr.push(
          <Row style={{
            border: '1px solid #f0f0f0',
            paddingTop: 20,
            marginBottom: 20,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100
          }} gutter={[8, 16]}>
            {
              props.tableTypeVO && props.tableTypeVO[item.type.split('.')[0]].map((itemm, index, arr) => {
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
                          <If when={(values) => props.checkProcessConditionVO.haveSelectAsset === '是'}>
                            <a
                              style={{ fontSize: 15 }}
                              onClick={() => selectAsset(itemm)}
                            >
                              选择
                            </a>
                          </If>
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
                              return values.hostAsId ? 'disabled' : 'edit'
                            }} name='sn' required validateConfig={{ type: 'string', required: true, message: '序列号不能为空' }}><Input style={{ width: '100px' }} /></FormItem>
                            <FormItem label='型号' name='model' required validateConfig={{ type: 'string', required: true, message: '型号不能为空' }}><Input style={{ width: '100px' }} /></FormItem>
                            <FormItem label="容量（GB）" name="price" validateConfig={{ type: 'number', required: true, message: '容量不能为空' }}><InputNumber style={{ width: '100px' }} /></FormItem>
                            <FormItem label="密级" name="miji"><Input style={{ width: '100px' }} placeholder='自动填充' disabled /></FormItem>
                            <FormItem status={(values, core) => {
                              return values.hostAsId ? 'edit' : 'disabled'
                            }} label='状态' name='state' defaultValue='在用' ><RadioGroup style={{ width: 200 }} options={diskStateOptions} /></FormItem>
                            <FormItem label="主机ID" name="hostAsId" ><InputNumber style={{ width: '100px' }} placeholder='自动填充' disabled /></FormItem>
                          </SelectTableRepeater>
                        </FormItem>
                      </Col>
                      <Col span={24} >
                        <FormItem layout={{ label: 4, control: 20 }}
                          label='变更情况' name='diskChangeDec'  >
                          {/* 因在effect里初始置空串，所以不能用defaultValue*/}
                          <Input disabled style={{ width: width * 3.5, fontWeight: 'bolder', color: 'red' }} placeholder='无变更' />
                        </FormItem>
                      </Col>

                    </>
                    )
                  else

                    return <Col span={24 / colNum}>
                      <FormItem label={itemm.label.split('.')[1]} name={itemm.name}>
                        <Input disabled style={{ width: width }} /></FormItem>
                    </Col>
                }
              })
            }
          </Row>
        )
      } else {
        tmpArr.push(<Col span={24 / colNum}>{getFormItem(item, core)}</Col>)
        if (tmpArr.length === colNum) {
          resultArr.push(<Row gutter={[8, 16]}>{tmpArr}</Row>)
          tmpArr = []
        }
        if (item.label.indexOf('硬盘变更')) {
          //setHasChangeDisk(true)//20220618  在组件创建时的渲染过程，不能使用SetState:会导致一直不停渲染
          hasChangeDisk = true;
        }
      }
    })
    if (tmpArr.length > 0) {
      resultArr.push(<Row>{tmpArr}</Row>)
    }
    return resultArr
  }

  const [roleArr, setRoleArr] = useState()
  const [userTree, setUserTree] = useState()
  useEffect(async () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveNextUser === '是') {
      const data1 = await ajax.get(sysRolePath.getRoleKT)
      data1 && setRoleArr(data1)
      const data2 = await ajax.get(sysDeptPath.getDeptUserTree)
      data2 && setUserTree(data2)
    }
  }, [])
  //是否有下一步处理人
  const renderHaveNextUser = () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveNextUser === '是') {
      return <div>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={'指定下一步处理人'} colon={false} style={{ fontWeight: 'bolder' }} /></Col>
        </Row>
        <FormItem name='operatorType' label='operatorType' style={{ display: 'none' }}><Input /></FormItem>
        <FormItem name='operatorTypeValue' label='operatorTypeValue' style={{ display: 'none' }}><Input /></FormItem>
        <FormItem name='haveStarterDept' label='haveStarterDept' style={{ display: 'none' }}><Input /></FormItem>
        <Row style={{
          border: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20
        }} gutter={[8, 16]}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label='处理人' required>
              <div>
                <FormItem name={'typeLabelErrMsg'} style={{ display: 'none' }}><Input /></FormItem>
                <Item
                  name='operatorTypeLabel'
                  validateConfig={{
                    operatorType: 'string',
                    required: true,
                    message: '处理人不能为空'
                  }}
                >
                  <Input style={{ width: width, marginRight: 5 }} disabled />
                </Item>
                <a onClick={() => {
                  Dialog.show({
                    title: '处理人',
                    footerAlign: 'label',
                    locale: 'zh',
                    width: 700,
                    content: <CheckUserTransfer roleArr={roleArr} userTree={userTree} />,
                    onOk: async (values, hide) => {
                      if (values.operatorType === '角色') {
                        if (!values.operatorTypeValue) {
                          message.error('角色不能为空')
                          return
                        }
                        const data = await ajax.get(sysRolePath.getRoleNameStr, { idArr: values.operatorTypeValue.split(',').map(item => item) })
                        if (data) {
                          core.setValues({ operatorType: values.operatorType, operatorTypeLabel: data, operatorTypeValue: values.operatorTypeValue })
                          if (values.haveStarterDept && values.haveStarterDept.length > 0) {
                            core.setValue('haveStarterDept', values.haveStarterDept.join(','))
                          }
                          hide()
                        }
                      } else {
                        if (!values.operatorTypeValue) {
                          message.error('用户不能为空')
                          return
                        }
                        const data = await ajax.get(sysUserPath.getNameStr, { idArr: values.operatorTypeValue.replaceAll('user', '').split(',').map(item => item) })
                        if (data) {
                          core.setValues({
                            haveStarterDept: null,
                            operatorType: values.operatorType,
                            operatorTypeLabel: data,
                            operatorTypeValue: values.operatorTypeValue.replaceAll('user', '')
                          })
                          hide()
                        }
                      }
                    }
                  })
                }} style={{ fontSize: 15 }}>选择</a>
                <Item render={(values, context) => {
                  if (values['typeLabelErrMsg']) {
                    return <div style={{ color: 'red' }}>{values['typeLabelErrMsg']}</div>
                  }
                  return null
                }} />
              </div>
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  //是否有操作记录
  const renderHaveOperate = () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveOperate === '是') {
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
            <FormItem label={'操作类型'} name="operate" value={['其他操作']}>
              <Checkbox.Group options={props.operateArr.map(val => ({ label: val, value: val }))} />
            </FormItem>
          </Col>
        </Row>
      </div>
    }
  }
  //是否有 意见/备注
  const renderHaveComment = () => {
    if (props.checkProcessConditionVO && props.checkProcessConditionVO.haveComment === '是') {
      return <div>
        <Divider style={{ fontSize: 14, lineHeight: 0, paddingTop: 20 }}>以下是审批或处理信息</Divider>
        <Row style={{
          border: '1px solid #f0f0f0',
          background: '#f0f0f0',
          marginTop: 10
        }}>
          <Col span={24 / props.processDefinition.formLayout}>
            <FormItem label={props.checkProcessConditionVO.commentTitle}
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
            <FormItem label={props.checkProcessConditionVO.commentTitle} name="comment">
              <Input.TextArea style={{ width: width }} placeholder="若有其他说明，请在此处填写" />
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
        {renderFormItem(props.formTree, 1, props.processDefinition.formLayout)}
        {renderHaveOperate()}
        {renderHaveComment()}
        {renderHaveNextUser()}
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
