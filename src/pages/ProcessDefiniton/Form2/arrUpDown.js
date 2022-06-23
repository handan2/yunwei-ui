//实现数组的上下移动，https://blog.csdn.net/helloxiaoliang/article/details/53637873
export default {
  swapItems: function(arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0]
  },
  upRecord: function(arr, index) {
    if (index === 0) {
      return
    }
    this.swapItems(arr, index, index - 1)
  },
  downRecord: function(arr, index) {
    if (index === arr.length - 1) {
      return
    }
    this.swapItems(arr, index, index + 1)
  },
  sort: function(arr, record, type) {
    let index = 0
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].index === record.index) {
        index = i
        break
      }
    }
    if (type === 'up') {
      this.upRecord(arr, index)
    } else {
      this.downRecord(arr, index)
    }
  }
}
