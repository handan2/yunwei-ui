



export const formItemValidate =(changeColumnLabelIdMap,values) =>{
        //注意此方法要执行在表单基本校验之后
        //const loginUser = JSON.parse(sessionStorage.getItem('user'))
        
        const idUserMiji = changeColumnLabelIdMap['计算机信息表.责任人密级']//如果表单里没有此项也不会报错；20211211突然报了一次，在退网流程时，后来又没复现了，待排查；知道了在流程定义那个页面里没有调用 这个函数。也不是是流程定义那个页面发起流程时formItemAutoComplete这个函数报表，todo研
        const idMiji = changeColumnLabelIdMap['计算机信息表.涉密级别']
        const idNetType = changeColumnLabelIdMap['计算机信息表.联网类别']
        if('非密'===values[idUserMiji+''] &&( '机密'===values[idMiji+'']||'秘密'===values[idMiji+'']) ){//准确点应写成values[idUserMiji+'']

            return ('非密人员不能使用涉密设备')
        }
        if('一般'===values[idUserMiji+''] && '机密'===values[idMiji+''] ){//准确点应写成values[idUserMiji+'']

            return ('低密级人员不能使用高密级设备')
        }
        //排除单机情况：values[idNetType]不能为空
        if( values[idNetType] &&'内网'!==values[idNetType] &&( '机密'===values[idMiji+'']||'秘密'===values[idMiji+'']) ){//准确点应写成values[idUserMiji+'']

            return ('联网类别和设备密级不匹配！')
        }
        //太长拆成几部分写
        if(values[idNetType] && ('互联网'===values[idNetType]||'商密网'===values[idNetType] )&& '非密'!==values[idMiji+'']){//准确点应写成values[idUserMiji+'']

            return ('联网类别和设备密级不匹配！')
        }

       
    
    }