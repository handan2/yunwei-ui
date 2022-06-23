import { useState } from 'react'

export default () => {
  //[1-数据字典-sysDicPath,2-部门管理-sysDeptPath,...]
  const [tabPanes, setTabPanes] = useState([])
  //1-数据字典-sysDicPath
  const [activeKey, setActiveKey] = useState('首页')
  return { tabPanes, setTabPanes, activeKey, setActiveKey }
}
