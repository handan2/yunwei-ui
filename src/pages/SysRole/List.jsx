import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, sysRolePath } from '../../utils'
import { OperateButton } from '../../components'

export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  return <List url={sysRolePath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <OperateButton path={sysRolePath} list={list}
                   selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
    <Table rowKey='id'
           rowSelection={{
             selectedRowKeys,
             onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
           }}
    >
      <Table.Column title="名称" dataIndex="name"/>
      <Table.Column title="备注" dataIndex="remark"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
