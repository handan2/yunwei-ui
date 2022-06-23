import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, processInstanceDataMyPath } from '../../utils'
import { QueryCondition, Space } from '../../components'
import { onClickForMy } from '../ProcessInstanceData/onClick'

export default () => {
  const [list, setList] = useState()

  const renderListButton = (text, record, idx) => {
    return <Space>
      <a onClick={() => onClickForMy(record, list)}>审批</a>
    </Space>
  }

  return <List url={processInstanceDataMyPath.list} onMount={list => list && setList(list)}
               formatBefore={listFormatBefore} formatAfter={listFormatAfter}>
    <QueryCondition path={processInstanceDataMyPath} list={list}/>
    <Table>
      <Table.Column title="流程名称" dataIndex="processName"/>
      <Table.Column title="提交人" dataIndex="displayName"/>
      <Table.Column title="提交部门" dataIndex="deptName"/>
      <Table.Column title="流程状态" dataIndex="processStatus"/>
      <Table.Column title="当前步骤" dataIndex="displayCurrentStep"/>
      <Table.Column title="提交时间" dataIndex="startDatetime"/>
      <Table.Column title="完成时间" dataIndex="endDatetime"/>
      <Table.Column title="操作" render={renderListButton}/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
