import { Button } from 'antd'
import { env, session } from '../../utils'
import { useModel } from 'umi'
import { Space } from '../../components'

export default (props) => {
  const { setModalVisit, setType, setTitle } = useModel('useProcessDefinition')
  const onClick = async (type) => {
    setType(type)
    setTitle('新建流程')
    setModalVisit(true)
  }
  const renderButton = () => {
    if (env === 'dev') {
      return <div>
        <Button icon='plus' type='primary' onClick={() => onClick('add')}>新建流程</Button>
      </div>
    }
    const buttonArr = session.getItem('operateButtonMap')[props.path.flag]
    return buttonArr.map(item => {
      return <Button icon={item.icon || 'plus'} type='primary' style={{ marginRight: 10 }}
                     onClick={() => onClick(item.permissionType)}>{item.name}</Button>
    })
  }

  return <Space style={{ marginBottom: 12 }}>
    {renderButton()}
  </Space>
}
