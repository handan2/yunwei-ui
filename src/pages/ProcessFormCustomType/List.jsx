import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, processFormCustomTypePath } from '../../utils'
import { OperateButton } from '../../components'

export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  return <List url={processFormCustomTypePath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
      <OperateButton path={processFormCustomTypePath} list={list} width={700}
                     selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
      <Table rowKey='id'
             rowSelection={{
               selectedRowKeys,
               onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
             }}
      >
        <Table.Column title="表名称" dataIndex="name"/>
      </Table>
      <Pagination showTotal={total => `共${total}条`}/>
    </List>
}
