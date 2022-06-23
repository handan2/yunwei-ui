import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'
import { ajax, session, sysUserPath } from '../../utils'
import { Button, Card } from 'antd'
import { history } from 'umi'

const validate = {
  loginName: { type: 'string', required: true, message: '登录账号不能为空' },
  password: { type: 'string', required: true, message: '登录密码不能为空' }
}
const core = new FormCore({ validateConfig: validate })

export default () => {
  return <div style={{ margin: '0 auto', width: 500, paddingTop: 50 }}>
    <Card title={'用户登录'} headStyle={{ textAlign: 'center', fontWeight: 'bolder' }}>
      <Form core={core} layout={{ label: 6, control: 18 }}>
        <FormItem label="登录账号" name="loginName" required><Input/></FormItem>
        <FormItem label="密码" name="password" required defaultValue={'123'}><Input.Password/></FormItem>
        <FormItem  >
          <Button  style = {{width:"200px"}} onClick={async () => {
            const errorArr = await core.validate()
            if (!errorArr) {
              const data = await ajax.get(sysUserPath.login, core.getValues())
              if (data) {
                session.setItem('user', data.user)
                session.setItem('displayName', data.user.displayName)
                session.setItem('menuList', data.menuList)
                session.setItem('operateButtonMap', data.operateButtonMap)
                session.setItem('dataListButtonMap', data.dataListButtonMap)
                session.setItem('startProcessButtonMap', data.startProcessButtonMap)
                session.setItem('queryMap', data.queryMap)
                session.setItem('roleIdList', data.roleIdList)
                history.push('/back')
              }
            }
          }} type="primary" size={'large'}>登录</Button>
        </FormItem>
      </Form>
    </Card>
  </div>
}
