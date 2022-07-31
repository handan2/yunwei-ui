import { Checkbox, DatePicker, Input, Dialog, InputNumber, Radio, Select, AutoComplete } from 'nowrapper/lib/antd'
import { Card, Col, message, Row, Modal, Table, ConfigProvider, Button } from 'antd';
import { FormItem, Item } from 'noform'
import getFormItem from './getFormItem';
import locale from 'antd/lib/date-picker/locale/zh_CN'
import CheckUserTransfer from './CheckUserTransfer';
import { TableRepeater, Selectify, ActionButton } from 'nowrapper/lib/antd/repeater';
import moment from 'moment'
import {
  ajax,
  sysRolePath,
  sysUserPath,
  width,
  session,
  asDeviceCommonPath,
  processFormTemplatePath,
  processDefinitionPath,
  formItemAutoComplete,

} from '../../utils';
import AsDeviceCommonQuery from './AsDeviceCommonQuery';
const SelectTableRepeater = Selectify(TableRepeater);
const { Group: RadioGroup } = Radio;
const diskStateOptions = [{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }, { label: '填错', value: '填错' }]
let repeaterModify1//用于中转给不能传参的函数用

/*
formTree:表单树
level:字段组递归的层次，方便缩进
colNum:一行几列
*/
export function renderFormItem(changeColumnLabelIdMap, userInfo, assetTypeIdForAff, connectTypeForAff, hideGroupLabel, formTree, level, colNum, selectGroupIdArr, processName, tableTypeVO, core, hasChangeDisk, repeaterModify, setRepeaterModify, labelIdMapForItem, processDefinitionId, haveSelectAssetForTask, assetMap, setAssetMap, hasOldProcess) {
  repeaterModify1 = repeaterModify
  let resultArr = [], tmpArr = [];//tmpArr是变更字段
  let tmpArrVisbleLength = 0;//20220721
  const hideGroupLabelArr = hideGroupLabel?.split(',')
  !connectTypeForAff && (connectTypeForAff = core.getValue('connectTypeForAff'))//20220723 connectTypeForAff在startForm的渲染未完成前，并没有写进CORE
  //VO &&

  formTree?.forEach((item) => {
    if (item.flag === '字段组类型') {
      if (//控制可选定可隐藏性(术语：区别与“可视性”/visible)字段组的DOM挂载
        //20220526.selectGroupIdArr包括两部分：可选字段组且已选择的（对应checkGroupIdArr）&&不可选字段组
        selectGroupIdArr &&
        _.indexOf(selectGroupIdArr, item.id) >= 0
        && _.indexOf(hideGroupLabelArr, item.label) < 0 //20220726 hideGroupLabelArr为null时，会不会报错：待验
      ) {
        let display = 'block'
        if (item.visible === '否')
          display = 'none'
        if (processName.indexOf('外设声像及办公自动化申领') != -1) {//只有在外设申领流程里 connectTypeForAff才有值
          if (item.label.indexOf('网络配置') != -1) {//约定了“网络配置”，不显示这个分组的情况  
            console.log('20220719  indexOf(网络配置)!=-1')
            if (connectTypeForAff.indexOf('直连网络') === -1) {
              console.log('进入网络配置隐藏分支')
              return
            }

          } else if (item.label.indexOf('上位机策略') != -1) {//约定了“上位机策略”，不显示这个分组的情况  
            if (connectTypeForAff.indexOf('连接计算机') === -1) {
              return
            }

          }

          else if (item.label.indexOf('三合一策略') != -1) {//约定了“网络配置”，不显示这个分组的情况  
            if (connectTypeForAff.indexOf('连接计算机') === -1) {
              return
            }
          }

        } else if (processName.indexOf('故障报修') != -1) {//20220726约定了维修流程名/“故障描述”
          if (item.label.indexOf('故障描述') != -1) {
            resultArr.push(
              <Row
                style={{
                  border: '1px solid #f0f0f0',
                  background: '#f0f0f0',
                  display,
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
                  display,
                  paddingTop: 20,
                  paddingBottom: 10,
                  paddingLeft: 50,//20220720
                  paddingRight: 50,
                  marginBottom: 20,
                  marginLeft: (level - 1) * 100,
                  marginRight: (level - 1) * 100,
                  // display:_.indexOf(hideGroupLabelArr,item.label)>= 0?'none':'block'
                }}
              >  {/*20220726 formItem 一行一列显示  */}
                {renderFormItem(changeColumnLabelIdMap, userInfo, assetTypeIdForAff, connectTypeForAff, hideGroupLabel, item.children, level + 1, 1, selectGroupIdArr, processName, tableTypeVO, core, hasChangeDisk, repeaterModify, setRepeaterModify, labelIdMapForItem, processDefinitionId, haveSelectAssetForTask, assetMap, setAssetMap, hasOldProcess)}
              </Row>,
            );

            return

          }
        }
        resultArr.push(
          <Row
            style={{
              border: '1px solid #f0f0f0',
              background: '#f0f0f0',
              display,
              marginTop: -10,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100,
              //仅仅是不可见时，必填项还是会判断
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
              display,
              paddingTop: 20,
              paddingBottom: 10,
              paddingLeft: 50,//20220720
              paddingRight: 50,
              marginBottom: 20,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100,
              // display:_.indexOf(hideGroupLabelArr,item.label)>= 0?'none':'block'
            }}
          >
            {renderFormItem(changeColumnLabelIdMap, userInfo, assetTypeIdForAff, connectTypeForAff, hideGroupLabel, item.children, level + 1, item.groupLayout, selectGroupIdArr, processName, tableTypeVO, core, hasChangeDisk, repeaterModify, setRepeaterModify, labelIdMapForItem, processDefinitionId, haveSelectAssetForTask, assetMap, setAssetMap, hasOldProcess)}
          </Row>,
        );

      }
    } else if (item.flag === '表类型') {
      if (item.label.indexOf('上位机信息') != -1) {//约定了“上位机信息”，不显示这个分组的情况  
        if (connectTypeForAff.indexOf('连接计算机') === -1 && processName.indexOf('外设声像及办公自动化申领') != -1) {
          return
        }
      }
      resultArr.push(
        <Row
          // id ='table2'
          style={{
            border: '1px solid #f0f0f0',
            background: '#f0f0f0',
            marginTop: 10,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100,
            //  display:rowTable1?'block':'none'
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
          // id ='table1'
          style={{
            border: '1px solid #f0f0f0',
            paddingTop: 20,
            paddingLeft: 50,//20220720
            paddingRight: 50,
            marginBottom: 20,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100,
          }}
          gutter={[8, 16]}
        >
          {tableTypeVO &&
            tableTypeVO[item.type.split('.')[0]].map(
              (itemm, index, arr) => {
                labelIdMapForItem.set('table_' + itemm.label.split('.')[1], itemm.name)//20220730记录表字段的label/name:为与了普通字段区分key:加了前缀"table_"
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
                          {(haveSelectAssetForTask === '是' || !hasOldProcess) && <a
                            style={{ fontSize: 15 }}
                            onClick={() => selectAsset(changeColumnLabelIdMap, userInfo, assetTypeIdForAff, itemm, hasChangeDisk, core, processDefinitionId, processName, labelIdMapForItem, connectTypeForAff, setRepeaterModify, assetMap, setAssetMap)}
                          >
                            选择
                          </a>}
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
                }
                else {
                  if (itemm.label.split('.')[1].indexOf('硬盘信息') != -1) {
                    console.log('renderFormitem 渲染硬盘信息里的hasChangeDisk  ', hasChangeDisk)
                    return renderDisk(hasChangeDisk, repeaterModify)

                  }
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


    } else {//20220714 变更与空转字段:但labelIdMapForItem记录不到空转字段（也记录就是index记为undefined）：后者的item.label.split('.')[1]为undefined
      let layout, width
      if ((item.label.indexOf('联系方式') != -1 || item.label.indexOf('故障类型') != -1 || item.label.indexOf('故障描述') != -1) && processName.indexOf('故障报修') != -1) {//20220726
        layout = { label: 4, control: 20 }
        if (item.label.indexOf('故障描述') != -1)
          width = 650
      }
      if (item.visible === '否') {
        labelIdMapForItem.set(item.label.split('.')[1], item.id)
        tmpArr.push(<Col span={24 / colNum} style={{ display: 'none' }}>{getFormItem(item, core, true)}</Col>);
      } else {
        labelIdMapForItem.set(item.label.split('.')[1], item.id)
        tmpArrVisbleLength++;
        tmpArr.push(<Col span={24 / colNum}>{getFormItem(item, core, null, layout, width)}</Col>);
        if (tmpArrVisbleLength === colNum) {
          resultArr.push(<Row gutter={[8, 16]}>{tmpArr}</Row>);
          tmpArr = [];
          tmpArrVisbleLength = 0;
        }
      }
    }
  });
  if (tmpArrVisbleLength > 0) {
    resultArr.push(<Row>{tmpArr}</Row>);
  }
  return resultArr;
};




export const renderDisk = (hasChangeDisk, repeaterModify) => <>
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
        <FormItem label="容量（GB）" name="price" validateConfig={{ type: 'number', required: true, message: '必填项' }}><InputNumber style={{ width: '100px' }} placeholder='若实物未购置，请填“0”' /></FormItem>
        <FormItem label="密级" name="miji"><Input style={{ width: '100px' }} placeholder='自动填充' disabled /></FormItem>
        <FormItem status={(values, core) => {
          return values.hostAsId ? 'edit' : 'disabled'
        }} label='状态' name='state' defaultValue='在用' ><RadioGroup style={{ width: 200 }} options={diskStateOptions} /></FormItem>
        <FormItem label="主机ID" name="hostAsId" ><InputNumber style={{ width: '100px' }} placeholder='自动填充' disabled /></FormItem>
      </SelectTableRepeater>
    </FormItem>
  </Col>
  {/* 20220714 hasChangeDisk对下面的控制  ； diskChangeDecNotForChangeComlumn的name属性组件并不能对应相应变更字段（甚至这个组件叫啥都无所谓，只要和硬盘信息编辑的逻辑一样即可）：后者name为纯数字：在硬盘信息编辑的逻辑里设置同名 名core/value, */}
  {hasChangeDisk && <Col span={24} >
    <FormItem layout={{ label: 4, control: 20 }}
      label='变更情况' name='diskChangeDecNotForChangeComlumn'  >
      {/* 因在effect里初始置空串，所以不能用defaultValue*/}
      <Input disabled style={{ width: width * 3.5, fontWeight: 'bolder', color: 'red' }} placeholder='无变更' />
    </FormItem>
  </Col>
  }
</>

export const renderView = (_, ctx) => {
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
    {repeaterModify1 && <Table.Column title="变更类型" dataIndex="flag" style={{ color: 'red' }} render={(value, record) => {
      return value ? <span style={{ color: 'red' }}>{value}</span> : <span>---</span>;
    }} />}
    <Table.Column title="操作" render={(value, record, index) => {
      return repeaterModify1 ? <div>
        <ActionButton core={coreList[index]} type="update"><Button size="small">编辑</Button></ActionButton>
        {/* <ActionButton core={coreList[index]} type="delete"><Button size="small">Remove</Button></ActionButton> */}
      </div> : <>---</>;
    }} />
  </Table>
}

export const selectAsset = async (changeColumnLabelIdMap, userInfo, assetTypeIdForAff, item, hasChangeDisk, core, processDefinitionId, processName, labelIdMapForItem, connectTypeForAff, setRepeaterModify, assetMap, setAssetMap) => {
  const customTableId = parseInt(item.name.split('.')[0]);//20220716
  const assetParams = { customTableId: customTableId, userDeptId: session.getItem('user').deptId }
  Dialog.show({
    title: '选择资产',
    footerAlign: 'label',
    locale: 'zh',
    enableValidate: true,
    width: 800,
    content: <AsDeviceCommonQuery params={assetParams} />,
    onOk: async (values, hide) => {
      if (!values.asDeviceCommonId) {
        message.error('选择一个资产');
        return;
      }
      console.log('选择完资产111')
      console.log(values)
      console.log('20220721 labelIdMapForItem')
      console.log(labelIdMapForItem)
      if (hasChangeDisk)//20220721这里的约定是变更硬盘流程 不会和外设入网同时进行； 或者再加一个限制，设备类型为“计算机”
        core.setValue('assetForComputerForDiskChang', values.asDeviceCommon)


      if (processName.indexOf('外设声像及办公自动化申领') != -1) {

        console.log('进入 外设声像及办公自动化申领')
        const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: values.asDeviceCommon.typeId })//20220720 todo记录日志：ajax参数里的空指针系统与运行都不报错，也不执行（network也监控不到请求）
        if (data) {
          if (data.id === 4) {//20220721约定了计算机/外设类的ID; 约定了两个资产不能同时变更相关的“变更字段”：因为我在记录变更字段map（label，ID）时，label只取了具体字段名（没用自定义表名约束：因为用了之后又会有自定义表名的约束了）
            core.setValue('assetForComputerForAff', values.asDeviceCommon)
            handelHideChangeColumnForAff(core, labelIdMapForItem, connectTypeForAff)
          } else if (data.id === 6) {
            core.setValue('assetForAff', values.asDeviceCommon)
            console.log('20220721选择了外设资产，刚setValue assetForAFF 即时获取他的值')
            console.log(core.getValue('assetForAff'))
            handelHideChangeColumnForAff(core, labelIdMapForItem, connectTypeForAff)

          }
        }

      }
      console.log('111111133311')
      const data = await ajax.get(
        processFormTemplatePath.getTableTypeInstData,//获取资产号对应的自定义表中的相应字段值数据
        {
          customTableId: customTableId,
          asDeviceCommonId: values.asDeviceCommonId,
          processDefinitionId: processDefinitionId,
        },
      );
      console.log('11111111111111')
      if (data) {//20220720 todo添加逻辑：如果是外设流程&&添加外设&&连接计算机，就在计算机那个隐藏字段里记录相关信息
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
        //20220731 挪到这
        formItemAutoComplete(assetArr,changeColumnLabelIdMap, core, userInfo, assetTypeIdForAff, labelIdMapForItem, connectTypeForAff, processName,)
        hide();
      }
    },
  });
};


//20220721
export const handelHideChangeColumnForAff = (core, labelIdMapForItem, connectTypeForAff) => {//选择完资产会执行
  console.log('20220724 labelIdMapForItem', labelIdMapForItem)
  if (core.getValue('connectTypeForAff').indexOf('直连网络') != -1) {
    core.setValue(labelIdMapForItem.get('接入主机资产号') + '', '无')
    core.setValue(labelIdMapForItem.get('接入主机端口') + '', '直连网络')
  } else if (connectTypeForAff.indexOf('连接计算机') != -1) {
    if (core.getValue('assetForComputerForAff') && core.getValue('assetForAff')) {
      console.log('20220721 两个资产都选择了才到这！！')
      const asNo = core.getValue('assetForComputerForAff').no
      const asNoAff = core.getValue('assetForAff').no
      core.setValue(labelIdMapForItem.get('接入主机资产号') + '', asNo)
      core.setValue(labelIdMapForItem.get('新接入外设') + '', '接入USB设备（' + asNoAff + ')')
      if (core.getValue(labelIdMapForItem.get('USB接口')) === '开启') {//20220721todo把默认 改开启，还有一问题，一state刷新就会成默认值
        core.setValue(labelIdMapForItem.get('接入主机端口') + '', 'USB')
      } else if (core.getValue(labelIdMapForItem.get('串口')) === '开启')
        core.setValue(labelIdMapForItem.get('接入主机端口') + '', '串口')
      else if (core.getValue(labelIdMapForItem.get('并口')) === '开启')
        core.setValue(labelIdMapForItem.get('接入主机端口') + '', '并口')
      else if (core.getValue(labelIdMapForItem.get('图像输出（VGA/HDMI/DVI等）')) === '开启')
        core.setValue(labelIdMapForItem.get('接入主机端口') + '', '图像输出（VGA/HDMI/DVI等）')
      else
        core.setValue(labelIdMapForItem.get('接入主机端口') + '', '其他')
    }

  } else if (core.getValue('connectTypeForAff').indexOf('独立运行') != -1) {
    core.setValue(labelIdMapForItem.get('接入主机资产号') + '', '无')
    core.setValue(labelIdMapForItem.get('接入主机端口') + '', '独立运行')
  }


}

export const renderAbnormalFormItem = (repeaterModify, processName) => {


  {/* 20220720可能仅为了变更硬盘用*/ }
  repeaterModify && <FormItem name="assetForComputerForDiskChange" style={{ display: 'none' }}>
    <Input />
  </FormItem>
  {/* 20220721 外设入网时的上位机专用  */ }
  processName.indexOf('外设声像及办公自动化申领') != -1 && <FormItem name="assetForComputerForAff" style={{ display: 'none' }}>
    <Input />
  </FormItem>
  {/* 20220721 外设入网时的外设专用  */ }
  processName.indexOf('外设声像及办公自动化申领') != -1 && <FormItem name="assetForAff" style={{ display: 'none' }}>
    <Input />
  </FormItem>
  {/* 20220720用于记录外设流程中用户选择项的记录（以在审批表单中传递）：也可以考虑把在自定表设计时，把变更字段加一个是否隐藏的选项，但又感觉意义不大：因为监听上玉文并给这个字段赋值还是需要手工在代码里写逻辑*/ }
  processName.indexOf('外设声像及办公自动化申领') != -1 && <FormItem name="connectTypeForAff" style={{ display: 'none' }}>
    <Input />
  </FormItem>
  {/* 20220720用于记录外设流程中用户选择项的记录（以在审批表单中传递）：也可以考虑把在自定表设计时，把变更字段加一个是否隐藏的选项，但又感觉意义不大：因为监听上玉文并给这个字段赋值还是需要手工在代码里写逻辑*/ }
  processName.indexOf('外设声像及办公自动化申领') != -1 && <FormItem name="netTypeForAff" style={{ display: 'none' }}>
    <Input />
  </FormItem>
  {/* 20220720用于记录外设流程中用户选择项的记录（以在审批表单中传递）：也可以考虑把在自定表设计时，把变更字段加一个是否隐藏的选项，但又感觉意义不大：因为监听上玉文并给这个字段赋值还是需要手工在代码里写逻辑*/ }
  processName.indexOf('外设声像及办公自动化申领') != -1 && <FormItem name="assetTypeIdForAff" style={{ display: 'none' }}>
    <Input />
  </FormItem>


}

//下一步处理人设置
export function renderHaveNextUser(haveNextUser, formLayout, roleArr, userTree, core) {
  if (haveNextUser === '是') {
    return (
      <div>
        <Row
          style={{
            border: '1px solid #f0f0f0',
            background: '#f0f0f0',
            marginTop: 10,
          }}
        >
          <Col span={24 / formLayout}>
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
          <Col span={24 / formLayout}>
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