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
const SelectTableRepeater = Selectify(TableRepeater);
let hasChangeDisk = false;

export default (props) => {
  const [core] = useState(new FormCore())
  const [diskStateOptions, setDiskStateOptions] = useState([{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }, { label: '填错', value: '填错' }])//
  useEffect(() => {
    core.reset()
    //表单的日期处理
    let values = formRule.dateHandle('parse', JSON.parse(props.processFormValue1.value))
    core.setValues({ ...values, diskListForHisForProcess: props.diskListForHisForProcess })
    core.setProps({
      repeater: { asyncHandler }
    })
    if (!core.getValues().diskChangeDec)
      core.setValues('diskChangeDec', '')
  }, [])

  const renderView = (_, ctx) => {
    const dataSource = ctx.getDataSource();
    const coreList = ctx.getCoreList();
    return <Table dataSource={dataSource} style={{ width: '200%' }} size='small' pagination={false} bordered={false} rowSelection={{ type: 'radio' }} >
      <Table.Column title="序列号" dataIndex="sn" />
      <Table.Column title="型号" dataIndex="model" />
      <Table.Column title="容量（GB）" dataIndex="price" />
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
      console.log('add 一开始 core.getValues()')
      console.log(props.record)
      console.log(core.getValues())
      let assetForComputer = core.getValues().assetForComputer
      console.log(assetForComputer)
      return ({
        success: true,
        item: {
          madeDate: moment().format('YYYY-MM-DD'),
          miji: assetForComputer.miji,
          hostAsId: assetForComputer.id,
          hostAsNo: assetForComputer.no,
          state: '在用',
          processInstanceDataId: props.record.id,
          name: '硬盘',
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
  /*
    formTree:表单树
    level:字段组递归的层次，方便缩进
    colNum:一行几列
   */
  const renderFormItem = (formTree, level, colNum) => {
    let resultArr = [], tmpArr = []
    formTree.forEach(item => {
      if (item.flag === '字段组类型') {
        if (props.selectGroupIdArr && _.indexOf(props.selectGroupIdArr, item.id) >= 0) {
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
                  return <Col span={24 / colNum}>
                    <FormItem label={itemm.label.split('.')[1]} name={itemm.name}>
                      <Input disabled style={{ width: width }} /></FormItem>
                  </Col>
              })
            }
          </Row>
        )
      } else {
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
    })
    if (tmpArr.length > 0) {
      resultArr.push(<Row>{tmpArr}</Row>)
    }
    return resultArr
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <Tabs animated={false}>
      <TabPane tab="表单" key="1">
      <FormItem name="asset" style={{ display: 'none' }}><Input /></FormItem>
      <FormItem name="assetForComputer" style={{ display: 'none' }}><Input /></FormItem>
      {renderFormItem(props.formTree, 1, props.processDefinition.formLayout)}
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
