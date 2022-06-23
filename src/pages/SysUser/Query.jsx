import { Filter } from 'nolist/lib/wrapper/antd'
import { Input, TreeSelect } from 'nowrapper/lib/antd'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { ajax, sysDeptPath } from '../../utils'

export default (props) => {
  const [treeData, setTreeData] = useState()
  useEffect(async () => {
    const data = await ajax.get(sysDeptPath.getDeptTree)
    setTreeData(data)
  }, [])

  return <Filter noDefaultLayout style={{ marginBottom: -10 }}>
    <Filter.Item label="登录账号:" name="loginName"><Input style={{ width: 100 }}/></Filter.Item>
    <Filter.Item label="用户姓名:" name="displayName"><Input style={{ width: 100 }}/></Filter.Item>
    <Filter.Item label="部门:" name="deptId">
      <TreeSelect style={{ width: 180 }} treeData={treeData} treeDefaultExpandAll/>
    </Filter.Item>
    <Filter.Search><Button icon="search" type='primary' style={{ marginRight: 10 }}>查询</Button></Filter.Search>
    <Filter.Clear><Button icon="reload">重置</Button></Filter.Clear>
  </Filter>
}
