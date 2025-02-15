// code/provider.js

await loadTool('AIScheduleTools')

const year = await AISchedulePrompt({
  titleText: '学年',
  tipText: '请输入本学年开始的年份',
  defaultText: '2024',
  validator: value => {
    try {
      const v = parseInt(value)
      if (v < 2000 || v > 2100) {
        return '请输入正确的学年'
      }
      return false
    } catch (error) {
      return '请输入正确的学年'
    }
  }
})

const term = await AISchedulePrompt({
  titleText: '学期',
  tipText: '请输入本学期的学期(1,2,3 分别表示上、下、短学期)',
  defaultText: '1',
  validator: value => {
    if (value === '1' || value === '2' || value === '3') {
      return false
    }
    return '请输入正确的学期'
  }
})

let termCode
switch (term) {
  case '1':
    termCode = '3'
    break
  case '2':
    termCode = '12'
    break
  case '3':
    termCode = '16'
    break
}

try {
  const res = await fetch("http://kjjw.ctgu.edu.cn/jwapp/sys/wdkb/modules/xskcb/xskcb.do", {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: `method=getKbcxAzc&xh=YOUR_STUDENT_ID&xnxqid=${year}-${termCode}&zc=1`
  })
  const data = await res.json()
  return JSON.stringify(data)
} catch (error) {
  await AIScheduleAlert('请确定你已经登陆了教务系统')
  return 'do not continue'
}
