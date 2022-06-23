import { useState } from 'react'
import { Button } from 'antd'
import { isArrayLikeObject } from '@umijs/deps/compiled/lodash'

export default (props) => {
  const { onClick, param } = props

  const [loading, setLoading] = useState(false)

  return <Button
    {...props}
    loading={loading}
    onClick={
      //我改进后
      // async () => {

      //   setLoading(true)

      //   await onClick(param)//20211221这里也是和下面一样“要求第一层调用的函数体就是一个async函数”
      //   setLoading(false)



        //张强原版
        // 张强原版
         () => {
          setLoading(true)
          try {
            onClick(param).then(() => {setLoading(false)})
          } catch (e) {//总会执行到catch里，因为.then方法提示不存在; 20211201把"第一层"onClick定义句柄传来就没事了：20211221可能“then只认第一层函数是异步的情况”//onClick.js <LoadingButton onClick={onClick} param={null} type={'primary'}></LoadingButton>
            console.log(e);
            setLoading(false)
         }




      }
    }>{props.children}</Button>
}
