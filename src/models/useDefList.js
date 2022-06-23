import { useState } from 'react'

export default () => {

    const [testFun, setTestFun] = useState()
    return {testFun, setTestFun}
}