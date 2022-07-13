



export const formItemAutoComplete =(data4,core, chooseUser) =>{
//console.log('formValidate',props)
    //const {data4,core} = props
   // const chooseUser = props.userInfo
    const loginUser = JSON.parse(sessionStorage.getItem('user'))
    const idUserMiji = data4['计算机详细信息表.责任人密级']
    const idUserName = data4['计算机详细信息表.责任人']//如果表单里没有此项也不会报错
    const idDept = data4['计算机详细信息表.责任部门']
    core.setValue(idDept,loginUser.temp)
    if(chooseUser?.committerName){//代他人填写：包括选择下拉人员和直接手写的
      core.setValue(idUserName,chooseUser.committerName)//好像idUserName不存在这个控件，也不会报错
    }else{//本人提交
      core.setValue(idUserMiji, loginUser.secretDegree)
      core.setValue(idUserName,loginUser.displayName)
    }
    if(chooseUser?.committerIdStr){//用户在“代他人填写里”选择了下拉人员
      core.setValue(idUserMiji,chooseUser.committerIdStr.split('.')[3])
     // core.setValue(idUserName,chooseUser.committerName)

    }
   

}