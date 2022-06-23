import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, processInstanceChangePath } from '../../utils'

export default (props) => {
  const [list, setList] = useState()

  return <List url={processInstanceChangePath.list + '?asId=' + props.record['asDeviceCommon.id']}
               onMount={list => setList(list)} formatBefore={listFormatBefore} formatAfter={listFormatAfter}> 
    <Table>
      <Table.Column title="属性名" dataIndex="name"/>
      <Table.Column title="旧值" dataIndex="oldValue"/>
      <Table.Column title="新值" dataIndex="newValue"/>
      <Table.Column title="修改人" dataIndex="displayName"/>
      <Table.Column title="修改时间" dataIndex="modifyDatetime"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
