import './index.less'

export default (props) => {
  return <div className={'ant-space'} style={{ ...props.style }}>{props.children}</div>
}
