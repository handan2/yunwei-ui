import moment from 'moment'
import 'moment/locale/zh-cn'
import _ from 'lodash'

const formRule = {
  /**
   * @param flag=stringify、parse
   */
  strHandle: function(flag, values) {
    let strValues = JSON.stringify(values)
    if (strValues.indexOf('strRule') > 0) {
      if (flag === 'stringify') {
        values = this.strRule.stringify(values)
      } else if (flag === 'parse') {
        values = this.strRule.parse(values)
      }
    }
    return values
  },
  //字符串序列化和反序列化
  strRule: {
    /**
     * @param columnName 将哪些字符串序列化，存储到表中对应的字段
     * @param exclude 排除序列化字段，比如id,name,status
     * @param include 哪些字段需要序列化
     */
    definition: ({ columnName, exclude, include }) => {
      return { columnName, exclude, include }
    },
    /**
     *表单add时，进行的字符串序列化处理
     */
    stringify: (values) => {
      let definitionInfo = values['strRule']
      if (definitionInfo) {
        let { columnName, exclude, include } = definitionInfo
        let obj = {}
        if (exclude) {
          exclude.forEach(key => {
            obj[key] = values[key]
            delete values[key]
          })
          obj[columnName] = JSON.stringify(values)
        } else {
          let obj2 = {}
          include.forEach(key => {
            obj2[key] = values[key]
            delete values[key]
          })
          obj[columnName] = JSON.stringify(obj2)
          Object.assign(obj, values)//浅拷贝
        }
        return obj
      }
      return values
    },
    /**
     * 表单edit,view时，进行的字符串反序列化处理
     */
    parse: (values) => {
      let strValues = JSON.stringify(values)
      if (strValues.indexOf('strRule') > 0) {
        let obj = {}
        Object.keys(values).map(key => {
          if ((values[key] + '').indexOf('strRule') > 0) {
            obj = { ...obj, ...JSON.parse(values[key]) }//JSON.parse:字符串转JS对象（应是json对象？）
          } else {
            obj[key] = values[key]
          }
        })
        return obj
      }
      return values
    }
  },
  /**
   * 将Momnet对象和日期字符串相互转换
   * @param flag=stringify、parse
   */
  dateHandle: function(flag, values) {//这个values只接收对象类型！！！这里的 'stringify'/'perse'只针对日期类型的数据值做处理
    let strValues = JSON.stringify(values)//这个strValues仅用于判断有没有存在日期类型，并不用于实际转换；values有时传过来已经是字符串（但再转也不会有事）
    if (strValues.indexOf('Date') > 0 || strValues.indexOf('Datetime') > 0) {
      let tmp = {}
      if (flag === 'stringify') {
        Object.keys(values).forEach(key => {
          if (values[key]) {//过滤了null值
            //判断key是否以Datetime结尾
            if (_.endsWith(key, 'DatetimeTmp') || _.endsWith(key, 'DateTmp')) {
              delete values[key]
            } else {
              tmp[key] = values[key]
            }
          }
        })
      } else if (flag === 'parse') {//20220414感觉这个情形应该是用于编辑时的渲染表单，此时的values应该是从后台返过来的
        Object.keys(values).forEach(key => {
          if (values[key]) {
            if (_.endsWith(key, 'Datetime')) {
              tmp[key] = values[key]
              tmp[key + 'Tmp'] = moment(values[key], 'YYYY-MM-DD HH:mm:ss')
            } else if (_.endsWith(key, 'Date')) {
              tmp[key] = values[key]
              tmp[key + 'Tmp'] = moment(values[key], 'YYYY-MM-DD')
            } else {
              tmp[key] = values[key]
            }
          }
        })
      }
      values = tmp
    }
    return values
  },
  //删除表单中多余的字段ErrMsg
  errMsgHandle: function(values) {
    let strValues = JSON.stringify(values)
    if (strValues.indexOf('ErrMsg') > 0) {
      let tmp = {}
      Object.keys(values).forEach(key => {
        if (values[key]) {
          //判断key是否以ErrMsg结尾
          if (_.endsWith(key, 'ErrMsg')) {
            delete values[key]
          } else {
            tmp[key] = values[key]
          }
        }
      })
      values = tmp
    }
    return values
  },
  /*
    表单项的相互转换：如下面这种转化称为“序列化”（stringify）:20220612但我觉得他叫法应该叫“反序列化”
    {'asDeviceCommon.typeId':'',asDeviceCommon.no:''}转为asDeviceCommon：{typeId:'',no:''}
   */
  formItemNameHandle: function(flag, values) {
    if (values['formItemNameFlag']) {
      let tmp = {}
      if (flag === 'stringify') {
        console.log('20220620 comeinto formItemNameHandle: stringify')
        Object.keys(values).forEach(key => {
          if (values[key]) {
            let nameArr = key.split('.')
            if (nameArr.length === 2) {
              if (tmp[nameArr[0]]) {
                tmp[nameArr[0]][nameArr[1]] = values[key]//20220612 注意：“二级对象的成员”可以用二维数组形式访问 
              } else {
                tmp[nameArr[0]] = {}
                tmp[nameArr[0]][nameArr[1]] = values[key]
              }
            } else {
              tmp[key] = values[key]
            }
          }
        })
      } else if (flag === 'parse') {
        Object.keys(values).forEach(key => {
          if (values[key]) {
            if (typeof values[key] === 'object' && !Array.isArray(values[key]) ) {//20220612增加对数组类型的排除：这样在处理diskList这种数组（对象数组也是一种“二级对象”：数组的index会被当成第一级对象的属性名）类型时，就不会被改造成对象(对应这里的tmp)了
              Object.keys(values[key]).forEach(keyy => {
                tmp[key + '.' + keyy] = values[key][keyy]
              })
            } else {
              tmp[key] = values[key]
            }
          }
        })
      }
      values = tmp
    }
    return values
  }
}

export { formRule }
