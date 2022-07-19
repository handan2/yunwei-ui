import Form, { FormCore, FormItem } from 'noform'
import { AutoComplete, Input, Select, TreeSelect } from 'nowrapper/lib/antd'
import { Button, Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import { ajax, asDeviceCommonPath, sysDeptPath,asTypePath } from '../../utils'
import { Space } from '../../components'

const core = new FormCore()

const width = 200
const span = 6

//查询表单方式二：利用noform
export default (props) => {
  const { list } = props
  const onClick = (type) => {
    if (type === 'query') {
      let params = {}
      let values = core.getValues()
      Object.keys(values).forEach(key => {
        if (values[key]) {
          params[key] = values[key]
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

  const [noOption, setNoOption] = useState()
  const [noOptionTmp, setNoOptionTmp] = useState()
  const [typeData, setTypeData] = useState()
  const [deptData, setDeptData] = useState()
  useEffect(async () => {
    const data = await ajax.get(asDeviceCommonPath.getAsDeviceCommonNoVL)
    if (data) {
      setNoOption(data)
      setNoOptionTmp(data)
    }
    const data2 = await ajax.get(asTypePath.getAsTypeTree)
    data2 && setTypeData(data2)
    const data3 = await ajax.get(sysDeptPath.getDeptTree)
    data3 && setDeptData(data3)
  }, [])


  return <Form core={core} defaultMinWidth={false} layout={{ label: 10, control: 14 }}>
    <Row gutter={[16, 16]}>
      <Col span={span}>
        <FormItem
          label="资产编号" name="no"
          onChange={(value) => {
            if (value) {
              let tmp = []
              noOption.forEach(item => {
                if (item.label.indexOf(value) >= 0) {
                  tmp.push(item)
                }
              })
              setNoOptionTmp(tmp)
            } else {
              setNoOptionTmp([])
            }
          }}
        >
          <AutoComplete style={{ width: width }} options={noOptionTmp}/>
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="资产类别" name="typeId">
          <TreeSelect
            style={{ width: width }}
            treeData={typeData}
            allowClear ={true}
          />
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="资产名称" name="name"><Input style={{ width: width }}/></FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="联网类别" name="netType">
          <Select
            style={{ width: width }}
            allowClear ={true}
            options={[
              { label: '内网', value: '内网' },
              { label: '商密网', value: '商密网' },
              { label: '试验网', value: '试验网' },
              { label: '互联网', value: '互联网' },
              { label: '未联网', value: '未联网' }]}/>
        </FormItem>
      </Col>
    </Row>
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <FormItem label="状态" name="state">
          <Select
            style={{ width: width }}
            allowClear ={true}
            options={[
              { label: '在用', value: '在用' },
              { label: '停用', value: '停用' },
              { label: '库存', value: '库存' },
              { label: '封存', value: '封存' },
              { label: '维修', value: '维修' },
              { label: '销毁', value: '销毁' }]}/>
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="使用部门" name="userDept">
          <TreeSelect
          allowClear ={true}
            style={{ width: width }}
            treeData={deptData}
            treeDefaultExpandAll
          />
        </FormItem>
      </Col>
      <Col span={span}>
        <FormItem label="责任人" name="userName"><Input style={{ width: width }}/></FormItem>
      </Col>
      <Col span={span}>
        <FormItem>
          <div>
            <Button  style={{ width: 75 }} icon='search' type='primary' onClick={() => onClick('query')}>查询</Button>
            <Button  style={{ width: 75}} icon='reload' onClick={() => onClick('reload')}>重置</Button>
          </div>
        </FormItem>
      </Col>
    </Row>
  </Form>
}
