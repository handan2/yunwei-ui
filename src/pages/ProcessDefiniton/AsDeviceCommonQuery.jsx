import Form, { FormCore, FormItem } from 'noform'
import { AutoComplete, Input } from 'nowrapper/lib/antd'
import { Button, Col, Row } from 'antd'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd';
import { ajax, asDeviceCommonPath, listFormatBefore, listFormatAfter, width } from '../../utils'
import React, { useEffect, useState } from 'react';
import { Space } from '../../components'

const core = new FormCore()

//查询表单方式二：利用noform
export default (props) => {
  const [list, setList] = useState()
  const [selectedRowKey, setSelectedRowKey] = useState()
  const onClick = (type) => {
    setSelectedRowKey(null)
    if (type === 'query') {
      let params1 = {}
      let values = core.getValues()
      Object.keys(values).forEach(key => {
        if (values[key]) {
          params1[key] = values[key]
        }
      })
      list.setParams({ ...params1, ...props.params })

      list.refresh()
    } else {
      core.reset()
      list.setParams({})
      list.refresh()
    }
  }

  const [noOption, setNoOption] = useState()
  const [noOptionTmp, setNoOptionTmp] = useState()
  useEffect(async () => {
    const data = await ajax.get(asDeviceCommonPath.getAsDeviceCommonNoVL)
    if (data) {
      setNoOption(data)
      setNoOptionTmp(data)
    }
  }, [])

  return <Form core={core}>
    <FormItem name="asDeviceCommonId" value={selectedRowKey} style={{ display: 'none' }}><Input /></FormItem>
    <Row gutter={[8, 16]} style={{ marginBottom: 10 }}>
      <Col span={8}>
        <FormItem
          defaultMinWidth={false}
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
          <AutoComplete style={{ width: 150 }} options={noOptionTmp} />
        </FormItem>
      </Col>
      <Col  span={8}>
        <FormItem label="资产名称" name="name" defaultMinWidth={false} ><Input style={{ width: 150 }} /></FormItem>
      </Col>
      <Col span={8}>
        <Space>
          <Button icon='search' type='primary' onClick={() => onClick('query')}>查询</Button>
          <Button icon='reload' onClick={() => onClick('reload')}>重置</Button>
        </Space>
      </Col>
    </Row> 
           {/* <Row gutter={[8, 16]}>
      <Col  style = {{background:'red'}} span={12}>   <Button icon='search' type='primary'>查询</Button></Col>
      <Col  style = {{background:'red'}} span={12}></Col>
      <Col  style = {{background:'red'}} span={12}>col-12</Col>
      <Col  style = {{background:'red'}} span={12}>col-12</Col>
    </Row> */}
    <List url={asDeviceCommonPath.list} params={props.params} onMount={listT => { setList(listT) }} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
      <Table rowKey='id'
        rowSelection={{
          type: 'radio',
          selectedRowKeys: [selectedRowKey],
          onChange: (selectedRowKeys, selectedRows) => {//20220617选择单选按钮变化时触发
            setSelectedRowKey(selectedRowKeys[0])
           // setSelectedRowKey(selectedRowKeys[0])
          
         
          console.log(selectedRows)
          core.setValues('asDeviceCommon',selectedRows[0])//
          }
        }}

        size='small'
        onRow={record => {//20220617在row上任意地点点击时触发
          return {
            onClick: () => {setSelectedRowKey(record.id)
            
              console.log('AsDeviceCommonQuery:rowSelection onRow')
              // setSelectedRowKey(selectedRowKeys[0])
             
            
             console.log(record)
             core.setValues('asDeviceCommon',record)//
            }
          }
        }}
      >
        <Table.Column title="资产编号" dataIndex="no" />
        <Table.Column title="资产名称" dataIndex="name" />
        <Table.Column title="联网类别" dataIndex="netType" />
        <Table.Column title="密级" dataIndex="miji" />
        <Table.Column title="责任人" dataIndex="userName" />
        <Table.Column title="状态" dataIndex="state" />
      </Table>
      <Pagination showTotal={total => `共${total}条`} />
    </List>
  </Form>

}
