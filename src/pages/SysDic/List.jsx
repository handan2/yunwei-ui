import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore, listFormatAfter,sysDicPath } from '../../utils'
import { OperateButton, QueryCondition } from '../../components'

export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  return <List url={sysDicPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
      <QueryCondition path={sysDicPath} list={list}/>
      <OperateButton path={sysDicPath} list={list}
                     selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
      <Table rowKey='id'
             rowSelection={{
               selectedRowKeys,
               onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
             }}
      >
        <Table.Column title="大类名称" dataIndex="flag"/>
        <Table.Column title="小类名称" dataIndex="name"/>
      </Table>
      <Pagination showTotal={total => `共${total}条`}/>
    </List>
}
