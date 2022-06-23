import { DatePicker, Input, Select } from 'nowrapper/lib/antd'
import { Button, Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { ajax, sysDicPath } from '../../utils'
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
      console.log(values);
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
      list.refresh()
    } else {
      core.reset()
      list.setParams({})
      list.refresh()
    }
  }

  const [processType, setProcessType] = useState()

  useEffect(async () => {
    const data2 = await ajax.get(sysDicPath.getDicVL, { flag: '流程分类' })
    data2 && setProcessType(data2)
  }, [])

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <Row gutter={[16, 16]}>
      <Col span={span}> <FormItem label="流程名称" name="processName"><Input style={{ width: width }}/></FormItem></Col>
      <Col span={span}>
        <FormItem label="事件分类" name="processType">
          <Select style={{ width: width }} options={processType}/>
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="提交时间" name="startDate"><DatePicker.RangePicker style={{ width: width }}/></FormItem>
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
