import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, sysUserPath } from '../../utils'
import { OperateButton, QueryCondition } from '../../components'



export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])


  return <List url={sysUserPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <QueryCondition path={sysUserPath} list={list}/>
    <OperateButton path={sysUserPath} list={list} width={600}
                   selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
    <Table rowKey='id'
           rowSelection={{
             selectedRowKeys,
             onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
           }}
    >
      <Table.Column title="登录账号" dataIndex="loginName"/>
      <Table.Column title="用户姓名" dataIndex="displayName"/>
      <Table.Column title="密级" dataIndex="secretDegree"/>
      <Table.Column title="部门" dataIndex="temp"/>
      <Table.Column title="身份证号" dataIndex="idNumber"/>
      <Table.Column title="创建时间" dataIndex="createDatetime"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
