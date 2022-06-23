import { DatePicker, Input, Select, TreeSelect } from 'nowrapper/lib/antd'
import { Button, Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { ajax, sysDeptPath, sysDicPath } from '../../utils'
import Form, { FormCore, FormItem } from 'noform'
import { Space } from '../../components'

const width = 180
const span = 6

const core = new FormCore()
export default (props) => {
  const { list } = props
  const onClick = (type) => {
    if (type === 'query') {
      let params = {}
      let values = core.getValues()
      Object.keys(values).forEach(key => {
        if (values[key]) {
          if (key === 'startDate' || key === 'endDate') {
            params[key] = (values[key].map(item => item.format('YYYY-MM-DD'))).join(',')
          } else {
            params[key] = values[key]
          }
        }
      })
      list.setParams(params)
      console.log(params);
      list.refresh()
    } else {
      core.reset()
      list.setParams({})
      list.refresh()
    }
  }

  const [deptData, setDeptData] = useState()
  const [processType, setProcessType] = useState()

  useEffect(async () => {
    const data = await ajax.get(sysDeptPath.getDeptTree)
    data && setDeptData(data)
    const data2 = await ajax.get(sysDicPath.getDicVL, { flag: '流程分类' })
    data2 && setProcessType(data2)
  }, [])

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="deptName" style={{ display: 'none' }}><Input /></FormItem>
    <Row gutter={[16, 16]}>
      <Col span={span}> <FormItem label="流程编号" name="id"><Input style={{ width: width }} /></FormItem></Col>
      <Col span={span}> <FormItem label="流程名称" name="processName"><Input style={{ width: width }} /></FormItem></Col>

      <Col span={span}>
        <FormItem label="流程分类" name="processType">
          <Select style={{ width: width }} options={processType} />
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="资产编号" name="no"><Input /></FormItem>
      </Col>
    </Row>
    <Row gutter={[16, 16]}>
      <Col span={span}>
        <FormItem label="提交时间" name="startDate"><DatePicker.RangePicker style={{ width: width }} /></FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="完成时间" name="endDate"><DatePicker.RangePicker style={{ width: width }} /></FormItem>
      </Col>
      <Col span={span}><FormItem label="提交人" name="displayName"><Input style={{ width: width }} /></FormItem></Col>
      <Col span={span}>
        <FormItem label="提交部门">
          <TreeSelect
            style={{ width: width }}
                      allowClear ={true}
            treeData={deptData}
            treeDefaultExpandAll
            onSelect={async (value, node) => {
              core.setValue('deptName', node.props.title)
            }}
          />
        </FormItem>
      </Col>
    </Row>
    <Row gutter={[16, 16]}>
      {/* <Col span={span}>
        <FormItem label="处理人" name="handleName"><Input style={{ width: width }} /></FormItem>
      </Col> */}
      <Col span={span}>
        <FormItem label="流程状态" name="processStatus">
          <Select
            style={{ width: width }}
            options={[
              { label: '审批中', value: '审批中' },
              { label: '处理中', value: '处理中' },
              { label: '完成', value: '完成' },
              { label: '退回', value: '退回' }]} />
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem>
          <Space>
            <Button icon='search' type='primary' onClick={() => onClick('query')}>查询</Button>
            <Button icon='reload' onClick={() => onClick('reload')}>重置</Button>
          </Space>
        </FormItem>
      </Col>
    </Row>
  </Form>
}
