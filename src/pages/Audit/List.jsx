import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import {  dataListButtonRender, listFormatBefore,listFormatAfter,  auditPath } from '../../utils'
import { OperateButton, QueryCondition, Space  } from '../../components'



export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  
  const renderListButton = (text, record, idx) => {
    return <Space>
      {dataListButtonRender(auditPath, list, record)}
    </Space>
  }


  return <List url={auditPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <QueryCondition path={auditPath} list={list}/>
    <OperateButton path={auditPath} list={list} width={600}
                   selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
    <Table rowKey='id'
           rowSelection={{
             selectedRowKeys,
             onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
           }}
    >
      <Table.Column title="编号" dataIndex="id"/>
      <Table.Column title="登录账号" dataIndex="loginName"/>
      <Table.Column title="用户姓名" dataIndex="displayName"/>
      <Table.Column title="IP" dataIndex="ip"/>
      <Table.Column title="操作时间" dataIndex="createDatetime"/>
      <Table.Column title="操作类型" dataIndex="operateType"/>
      {/* <Table.Column title="操作参数" width="500px"  dataIndex="param"/> */}
      <Table.Column style={{padding: '0px'}}title="操作参数"   width="180px" render={renderListButton} />
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
