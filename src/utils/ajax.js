import request from 'umi-request'
import { Modal } from 'antd'
const { confirm } = Modal;
import { history } from 'umi'

class ajax {
  static post(url, values) {
    if (!url) {
      Modal.error({ content: '缺少url', okText: '知道了' })
      return
    }
    return request.post(url, { data: values }).then(res => {
      if ( res.msg === '用户未登录') {

  
        Modal.error({ content: '登录过期', okText: '重新登录', onOk: () => history.push('/login') })
      } else if (res.code === 200) {
        //返回值为Object={code,msg,data}
        if(res.data ===false)//20220612加：后端在处理不成功（但没发生异常）通常会返回false
          Modal.error({content:'返回状态值异常', okText: '知道了' })
        else return res.data
      } else {
        Modal.error({ content: res.msg || '操作失败', okText: '知道了' })
      }
    }).catch(err => {//20211219此时也会返回，只是返回为空罢了；超时也会被捕获；20220517张强：后台系统自动抛的异常（那个异常捕获机制捕不到）也会到这里
      Modal.error({ content: '网络错误', okText: '知道了' })
    })
  }

  static get(url, params) {
    if (!url) {
      Modal.error({ content: '缺少url', okText: '知道了' })
      return
    }
    return request.get(url, { params: params }).then(res => {
      if (res.msg === '用户未登录') {
        Modal.error({ content: '登录过期', okText: '重新登录', onOk: () => history.push('/login') })
      } else if (res.code === 200) {
        //返回值为Object={code,msg,data}
        return res.data
      } else {
        Modal.error({ content: res.msg || '操作失败', okText: '知道了' })
      }
    }).catch(err => {
      Modal.error({ content: '网络错误', okText: '知道了' })
    })
  }
}

export { ajax }
