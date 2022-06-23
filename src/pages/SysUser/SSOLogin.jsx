import { ajax, session, sysUserPath } from '../../utils'
import { Button, Card, Spin } from 'antd'
import { history, useModel } from 'umi'
import { useEffect } from 'react'


export default () => {
  const { setTabPanes, setActiveKey } = useModel('useTabPanes')

  useEffect(async () => {
    const data = await ajax.get(sysUserPath.ssoLogin)
    if (data) {
      session.setItem('user', data.user)
      session.setItem('displayName', data.user.displayName)
      session.setItem('menuList', data.menuList)
      session.setItem('operateButtonMap', data.operateButtonMap)
      session.setItem('dataListButtonMap', data.dataListButtonMap)
      session.setItem('startProcessButtonMap', data.startProcessButtonMap)
      session.setItem('queryMap', data.queryMap)
      session.setItem('roleIdList', data.roleIdList)
      setTabPanes([])
      setActiveKey('首页')
      history.push('/back')
    }
  }, [])

  return <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
    <Spin tip={'加载中...'}/>
  </div>

}
