import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem } from 'noform'
import { Card, Col, Row, Tabs } from 'antd'
import { ajax, asDeviceCommonPath, sysDeptPath } from '../../utils'
import { DatePicker, Input, InputNumber, Radio, TreeSelect } from 'nowrapper/lib/antd'
import locale from 'antd/lib/date-picker/locale/zh_CN'
import ProcessInstanceChangeList from '../ProcessInstanceChange/List'
import ProcessInstanceHistoryList from '../ProcessInstanceData/HistoryList'
import ProcessInstanceCurrentList from '../ProcessInstanceData/CurrentList'
import { RepeaterAdvanced } from '../../components'
import { TableRepeater, Selectify } from 'nowrapper/lib/antd/repeater';
import moment from 'moment'
const { Group: RadioGroup } = Radio;
const SelectTableRepeater = Selectify(TableRepeater);
const { TabPane } = Tabs
const width = 250, span = 12
//const core = useState(new FormCore())//20220613挪动到这
const core = new FormCore()
export default (props) => {
  const { type, record } = props
  console.log('form-20220613')
  console.log(record)
  //设备对应的分类树中level2的类型ID
  const [typeId, setTypeId] = useState()
  const [treeData, setTreeData] = useState()
  const [deptUserTreeSelectData, setDeptUserTreeSelectData] = useState()

  useEffect(async () => {
    const data = await ajax.get(asDeviceCommonPath.getAsTypeTree)
    if (data) {
      setTreeData(data)
    }
    const data1 = await ajax.get(sysDeptPath.getDeptUserTreeSelect)
    if (data1) {
      setDeptUserTreeSelectData(data1)
    }
    if (type === 'add') {
      core.reset()
      core.setValues({ 'asDeviceCommon.shared': '否' })
    } else {
      core.setValues(record)
      core.setValues({ 'repeater': { dataSource: record.diskList } })//20220611
      core.setValues({ 'diskListForHis': record.diskList })//20220611
      console.log('编辑表单 中获得的props值')
      console.log(record)
      const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: record['asDeviceCommon.typeId'] })
      if (data) {
        setTypeId(data.id)
      }
    }
    core.setProps({//20220613
      repeater: { asyncHandler }
    })

  }, [props])//20211121感觉没必要监控props,用初始化[]就这种就可以了，毕竟每次通过list打开form,后续资产多标签页的结构就不会变化


  const asyncHandler = {
    add: async (values) => {
      // await sleep(1); //20220613一加这句点“确定”就不动了，不管sleep多久都是：暂不深研
      console.log('add函数')
      let obj = {}
      //let formvalues = core.getValues()//add里不能用State,core也是
      if (type === 'add') {

        obj = {
          success: true,
          item: {
            madeDate: moment().format('YYYY-MM-DD'),
            //   userName:formvalues['asDeviceCommon.userName']?formvalues['asDeviceCommon.userName']:'',
            //   userDept: formvalues['asDeviceCommon.userDept']?formvalues['asDeviceCommon.userDept']:'',
            //   miji:  formvalues['asDeviceCommon.miji']? formvalues['asDeviceCommon.miji']:'',
            //   userMiji:  formvalue['asDeviceCommon.userMiji']?formvalue['asDeviceCommon.userMiji']:'',
            //  // hostAsId: record['asDeviceCommon.id'],
            //temp:'新增',
            typeId: 25,//给他固产分类ID：其他类型（注意要是二级分类）
            name: '硬盘',
            //   netType: formvalue['asDeviceCommon.netType']? formvalue['asDeviceCommon.netType']:'',
            key: Math.random().toString(36).slice(2),//仅用于界面逻辑：区分成员
            no: 'YP' + Math.random().toString(36).slice(2)
          }
        }
      } else
        obj = {
          success: true,
          item: {
            madeDate: moment().format('YYYY-MM-DD'),
            userName: record['asDeviceCommon.userName'],
            userDept: record['asDeviceCommon.userDept'],
            miji: record['asDeviceCommon.miji'],
            userMiji: record['asDeviceCommon.userMiji'],
            hostAsId: record['asDeviceCommon.id'],
            typeId:25,//给他固产分类ID：其他类型（注意是一级分类）
            name: '硬盘',
            netType: record['asDeviceCommon.netType'],
            key: Math.random().toString(36).slice(2),//仅用于界面逻辑：区分成员
            no: 'YP' + Math.random().toString(36).slice(2)
          }
        }
      return (obj);
    },
    // update: async (values) => {
    //     await sleep(500);
    //     return ({
    //         success: true,
    //         item: {
    //             ...values,
    //             username: 'modified by update handler',
    //         }
    //     });
    // },
    delete: async () => {
      //await sleep(500);
      return false;
    },
    select: async (checked, current, currentArray) => {
      //await sleep(500);
      console.log('select')
      return true;
    },
    //20220608
    afterSetting: (event, repeater) => {
      console.log(event.type);
      console.log('event', event, 'repeater', repeater);
      let values = repeater.getValues();

      if (type === 'add') {
        if (values)
          core.setValues('diskListForHis', values)
      }
      else {
        let valuesForHis = core.getValues().diskListForHis;
        let valuesForHisNew
        if (event.type === 'add') {
          let index = event.index;
          values[index].temp = '新增'
          valuesForHis.push(values[index])
          valuesForHisNew = valuesForHis
        }
        if (event.type === 'delete') {
          let value = event.item.value
          valuesForHisNew = valuesForHis.map(item => {
            if (item.key) {//有key即为新增的数据
              if (item.key === value.key)
                item.temp = '删除'
            }
            if (item.sn)
              if (item.sn === value.sn && item.model === value.model)//可能因重复值误删除多个，但不考虑这两值同时重复
                item.temp = '删除'
            return item
          })
        }
        if (event.type === 'update') {
          let index = event.index;
          valuesForHisNew = valuesForHis.map(item => {
            if (item.key) {//有key即为新增的数据
              if (item.key === values[index].key) {
                item = values[index]
                item.temp = '修改'
              }
            }
            if (item.id) {//有id是从DB里读的原始记录
              if (item.id === values[index].id) {
                item = values[index]
                item.temp = '修改'
              }
            }
            return item
          })
        }
        console.log('afterSetting:最后部分:')
        console.log(valuesForHisNew)
        console.log(core.getValues().repeater)
        if (valuesForHisNew)
          core.setValues('diskListForHis', valuesForHisNew)
        console.log(core.getValues().diskListForHis)
      }

  
    }
  }

  const showAsDeviceCommonForm = () => {
    return <>
      <Row gutter={[8, 16]}>
        <FormItem name="asDeviceCommon.id" style={{ display: 'none' }}><Input style={{ width: width }} /></FormItem>
        <Col span={span}>
          <FormItem name='asDeviceCommon.no' label='资产编号' required
            validateConfig={{ type: 'string', required: true, message: '资产编号不能为空' }}>
            <Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem label="资产类别" name="asDeviceCommon.typeId" required
            validateConfig={{ type: 'number', required: true, message: '资产类别不能为空' }}>
            <TreeSelect
              style={{ width: width }}
              treeData={treeData}
              treeDefaultExpandAll
              onSelect={async (value, node) => {
                const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: value })
                if (data) {
                  setTypeId(data.id)
                  core.setValue('asDeviceCommon.typeId', value)
                }
              }}
            />
          </FormItem>
        </Col>

      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.name' label='资产名称'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.baomiNo' label='保密编号'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.fundSrc' label='资金来源'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.netType' label='联网类别'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.portNo' label='信息点号'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.hostName' label='主机名称'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.location' label='所在位置'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.shared' label='是否合用'>
            <Radio.Group
              options={[
                { label: '是', value: '是' },
                { label: '否', value: '否' }]} />
          </FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.nameShared' label='合用人'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.state' label='状态'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.usagee' label='用途'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.administrator' label='管理员'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.adminTel' label='管理员电话'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userName' label='使用人'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userDept' label='使用部门'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userMiji' label='使用人密级'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.userTel' label='使用人电话'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.manufacturer' label='设备厂商'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.model' label='设备型号'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.sn' label='设备序列号'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.madeDate'><Input /></FormItem></div>
          <FormItem name='asDeviceCommon.madeDateTmp' label='生产日期' width={width}
            onChange={date => {
              if (date) {
                core.setValue('asDeviceCommon.madeDate', date.format('YYYY-MM-DD'))
              } else {
                core.setValue('asDeviceCommon.madeDate', '')
              }
            }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }} />
          </FormItem>
        </Col>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.buyDate'><Input /></FormItem></div>
          <FormItem name='asDeviceCommon.buyDateTmp' label='购买日期' width={width}
            onChange={date => {
              if (date) {
                core.setValue('asDeviceCommon.buyDate', date.format('YYYY-MM-DD'))
              } else {
                core.setValue('asDeviceCommon.buyDate', '')
              }
            }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }} />
          </FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.useDate'><Input /></FormItem></div>
          <FormItem name='asDeviceCommon.useDateTmp' label='启用日期' width={width}
            onChange={date => {
              if (date) {
                core.setValue('asDeviceCommon.useDate', date.format('YYYY-MM-DD'))
              } else {
                core.setValue('asDeviceCommon.useDate', '')
              }
            }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }} />
          </FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.price' label='价格'><InputNumber style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <div style={{ display: 'none' }}><FormItem name='asDeviceCommon.discardDate'><Input /></FormItem></div>
          <FormItem name='asDeviceCommon.discardDateTmp' label='报废日期' width={width}
            onChange={date => {
              if (date) {
                core.setValue('asDeviceCommon.discardDate', date.format('YYYY-MM-DD'))
              } else {
                core.setValue('asDeviceCommon.discardDate', '')
              }
            }}>
            <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }} />
          </FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.ip' label='IP地址'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.mac' label='MAC地址'><Input style={{ width: width }} /></FormItem>
        </Col>
        <Col span={span}>
          <FormItem name='asDeviceCommon.miji' label='涉密级别'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
      <Row gutter={[8, 16]}>
        <Col span={span}>
          <FormItem name='asDeviceCommon.remark' label='备注'><Input style={{ width: width }} /></FormItem>
        </Col>
      </Row>
    </>
  }

  const showSpecialForm = () => {
    if (typeId) {
      if (typeId === 4) {
        //计算机
        return <>
          <Card size='small' title='计算机专用' bordered={false}>
            <Row gutter={[8, 16]}>
              <FormItem name="asComputerSpecial.id" style={{ display: 'none' }}><Input
                style={{ width: width }} /></FormItem>
              <Col span={span}>
                <FormItem name='asComputerSpecial.netInterface' label='网络接口'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.ram' label='物理内存(MB)'><InputNumber
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.cdrom' label='光驱'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.videoCard' label='显卡'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.macBackup' label='备用网卡MAC'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.soundCard' label='声卡'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <div style={{ display: 'none' }}><FormItem name='asComputerSpecial.osDate'><Input /></FormItem></div>
                <FormItem name='asComputerSpecial.osDateTmp' label='操作系统安装时间' width={width}
                  onChange={date => {
                    if (date) {
                      core.setValue('asComputerSpecial.osDate', date.format('YYYY-MM-DD'))
                    } else {
                      core.setValue('asComputerSpecial.osDate', '')
                    }
                  }}>
                  <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: width }} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.osType' label='操作系统'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.cpuTotal' label='CPU个数'><InputNumber
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskTotal' label='硬盘个数'><InputNumber
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSize' label='硬盘总容量'><InputNumber
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode1' label='硬盘型号1'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode2' label='硬盘型号2'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode3' label='硬盘型号3'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskMode4' label='硬盘型号4'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn1' label='硬盘序列号1'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn2' label='硬盘序列号2'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn3' label='硬盘序列号3'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerSpecial.diskSn4' label='硬盘序列号4'><Input style={{ width: width }} /></FormItem>
              </Col>
            </Row>
          </Card>
          <Card size='small' title='硬盘信息' bordered={false}>

            <FormItem label="" layout={{ label: 1, control: 23 }} name="repeater">
              <SelectTableRepeater locale='zh' >
                <FormItem label='序列号' name='sn' ><Input style={{ width: '100px' }} /></FormItem>
                <FormItem label='型号' name='model'><Input style={{ width: '100px' }} /></FormItem>
                <FormItem label="容量" name="price" validateConfig={{ type: 'number', required: true, message: '容量不能为空' }}><InputNumber style={{ width: '100px' }} /></FormItem>
                <FormItem label="密级" name="miji"><Input style={{ width: '100px' }}  placeholder='自动填充' disabled /></FormItem>
                <FormItem label='状态' name='state' defaultValue = '在用'><RadioGroup style={{ width: 200 }} options={[{ label: '在用', value: '在用' }, { label: '报废', value: '报废' }]} /></FormItem>
                <FormItem label="主机ID" name="hostAsId"><InputNumber style={{ width: '100px' }}  placeholder='自动填充' disabled /></FormItem>

              </SelectTableRepeater>
            </FormItem>
          </Card>
          <Card size='small' title='计算机权限' bordered={false}>
            <Row gutter={[8, 16]}>
              <FormItem name="asComputerGranted.id" style={{ display: 'none' }}><Input
                style={{ width: width }} /></FormItem>
              <Col span={span}>
                <FormItem name='asComputerGranted.usb' label='USB接口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.serial' label='串口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.parallel' label='并口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.hongwai' label='红外' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.bluetooth' label='蓝牙' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.screenShot' label='拷屏' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.dev1394' label='1394' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.connection' label='设备接入' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.ipBind' label='IP绑定' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.vm' label='虚拟机' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.docShare' label='文件共享' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.pcmcia' label='PCMCIA' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.devImage' label='图形设备' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.devJuanying' label='卷影设备' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.portShemi' label='多功能导入装置涉密口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asComputerGranted.portCommon' label='多功能导入装置通用口' defaultValue='关闭'>
                  <Radio.Group
                    options={[
                      { label: '开启', value: '开启' },
                      { label: '关闭', value: '关闭' }]} />
                </FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 5) {
        //网络设备
        return <>
          <Card size='small' title='网络设备' bordered={false}>
            <FormItem name="asNetworkDeviceSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }} /></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.rom' label='内存ROM(MB)'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.flash' label='内存FLASH(MB)'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.portTotal' label='端口总数'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asNetworkDeviceSpecial.ios' label='IOS版本'><Input style={{ width: width }} /></FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 6) {
        //外设
        return <>
          <Card size='small' title='外设' bordered={false}>
            <FormItem name="asSecurityProductsSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }} /></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem name='asSecurityProductsSpecial.certificateName' label='检测证书名称'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asSecurityProductsSpecial.certificateSn' label='检测证书编号'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <div style={{ display: 'none' }}>
                  <FormItem name='asSecurityProductsSpecial.certificateDatetime'><Input /></FormItem>
                </div>
                <FormItem name='asSecurityProductsSpecial.certificateDatetimeTmp' label='证书有效期' width={width}
                  onChange={date => {
                    if (date) {
                      core.setValue('asSecurityProductsSpecial.certificateDatetime', date.format('YYYY-MM-DD'))
                    } else {
                      core.setValue('asSecurityProductsSpecial.certificateDatetime', '')
                    }
                  }}>
                  <DatePicker locale={locale} format="YYYY-MM-DD HH:mm:ss" style={{ width: width }} />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asSecurityProductsSpecial.strategy' label='策略'><Input
                  style={{ width: width }} /></FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 7) {
        //安全防护产品
        return <>
          <Card size='small' title='安全防护产品' bordered={false}>
            <FormItem name="asComputerSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }} /></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem name='asIoSpecial.accessHostNo' label='接入主机资产号'><Input style={{ width: width }} /></FormItem>
              </Col>
              <Col span={span}>
                <FormItem name='asIoSpecial.accessPort' label='接入主机端口'><Input style={{ width: width }} /></FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else if (typeId === 19) {
        //应用系统 
        return <>
          <Card size='small' title='应用系统' bordered={false}>
            <FormItem name="asApplicationSpecial.id" style={{ display: 'none' }}><Input
              style={{ width: width }} /></FormItem>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem label="系统管理员" name="asApplicationSpecial.sysadminId" required
                  validateConfig={{ type: 'number', required: true, message: '管理员不能为空' }}>
                  <TreeSelect
                    style={{ width: width }}
                    treeData={deptUserTreeSelectData}
                    treeDefaultExpandAll
                    onSelect={(value, node) => {
                      // const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: value })     
                      core.setValue('asApplicationSpecial.sysadminId', value)
                    }}
                  />
                </FormItem>
              </Col>
              <Col span={span}>
                <FormItem label="安全管理员" name="asApplicationSpecial.safeadminId" required
                  validateConfig={{ type: 'number', required: true, message: '管理员不能为空' }}>
                  <TreeSelect
                    style={{ width: width }}
                    treeData={deptUserTreeSelectData}
                    treeDefaultExpandAll
                    onSelect={(value, node) => {
                      // const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: value })     
                      core.setValue('asApplicationSpecial.safeadminId', value)
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={[8, 16]}>
              <Col span={span}>
                <FormItem label="审计员" name="asApplicationSpecial.auditadminId" required
                  validateConfig={{ type: 'number', required: true, message: '管理员不能为空' }}>
                  <TreeSelect
                    style={{ width: width }}
                    treeData={deptUserTreeSelectData}
                    treeDefaultExpandAll
                    onSelect={(value, node) => {
                      // const data = await ajax.get(asDeviceCommonPath.getLevelTwoAsTypeById, { typeId: value })     
                      core.setValue('asApplicationSpecial.auditadminId', value)
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
          </Card>
        </>
      } else {
        return <>
          <Card size='small' title='该设备类别无专用属性' bordered={false}></Card></>
      }
    } else {
      return <>
        <Card size='small' title='请先选择设备类别！' bordered={false}></Card></>
    }
  }

  const showTabPane = () => {
    let arr = []
    if (type !== 'add') {
      arr.push(
        <TabPane tab="当前工单" key="3">
          <ProcessInstanceCurrentList record={record} />
        </TabPane>
      )
      arr.push(
        <TabPane tab="历史工单" key="4">
          <ProcessInstanceHistoryList record={record} />
        </TabPane>
      )
      arr.push(
        <TabPane tab="属性变更记录" key="5">
          <ProcessInstanceChangeList record={record} />
        </TabPane>
      )
    }
    return arr
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name='formItemNametemp' style={{ display: 'none' }} value='formItemNametemp'><Input /></FormItem>
  {/* 20220620加 */}
    <FormItem name='formItemNameFlag' style={{ display: 'none' }} value='formItemNameFlag'><Input /></FormItem>
    <Tabs animated={false}>
      <TabPane tab="基本属性" key="1">
        {showAsDeviceCommonForm()}
      </TabPane>
      <TabPane tab="专有属性" key="2">
        {showSpecialForm()}
      </TabPane>
      {showTabPane()}
    </Tabs>
  </Form>
}
