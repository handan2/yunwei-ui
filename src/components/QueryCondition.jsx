import { env, session } from '../utils'

export default (props) => {
  const { path, list } = props

  const renderQuery = () => {
    if (env === 'dev') {
      return <path.Query list={list}/>
    }

    const query = session.getItem('queryMap')[props.path.flag]
    if (query) {
      return <path.Query list={list}/>
    }
  }
  return <div style={{ marginBottom: 10 }}>
    {renderQuery()}
  </div>
}
