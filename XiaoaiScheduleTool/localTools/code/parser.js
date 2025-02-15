async function scheduleTimer() {
  // 科院的时间配置接口地址
  let time =  "http://kjjw.ctgu.edu.cn/jwapp/sys/cxxszhxqkb.do"

  // 时间配置，根据实际情况修改
  let dJConf = {
      courseSum: 12, // 课程总节数
      startTime: '800', // 上课时间，格式为 HHMM
      oneCourseTime: 45, // 每节课时长，单位分钟
      longRestingTime: 20, // 长休息时间，单位分钟
      shortRestingTime: 5, // 短休息时间，单位分钟
      longRestingTimeBegin: [2, 7], // 长休息开始的节次（即第二节、第八节后有长休息）
      lunchTime: { begin: 5, time: 2 * 60 }, // 午休时间
      dinnerTime: { begin: 8, time: 1 * 60 + 10 }, // 晚餐时间
  }

  let xJConf = {
      courseSum: 12, 
      startTime: '820', 
      oneCourseTime: 40, 
      longRestingTime: 15, 
      shortRestingTime: 10, 
      longRestingTimeBegin: [2, 7], 
      lunchTime: { begin: 4, time: 2 * 60 + 5 }, 
      dinnerTime: { begin: 8, time: 2 * 60 - 25 },
  }
  
  let xJTimes = getTimes(xJConf, dJConf);
  let dJTimes = getTimes(dJConf, dJConf);
  
  console.log("夏季时间:\n", xJTimes);
  console.log("冬季时间:\n", dJTimes);
  return {
      'totalWeek': 19, // 总周数：[1, 30]之间的整数
      'startSemester': '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
      'startWithSunday': false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
      'showWeekend': false, // 是否显示周末
      'forenoon': 5, // 上午课程节数：[1, 10]之间的整数
      'afternoon': 4, // 下午课程节数：[0, 10]之间的整数
      'night': 3, // 晚间课程节数：[0, 10]之间的整数
      'sections': xJTimes, // 课程时间表，注意：总长度要和上边配置的节数加和对齐
  }
}

  let req = async (method,body,url)=>{
      return await fetch(url,{method:method, body:body,headers:{
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }}).then(re=>re.json()).then(v=>v).catch(err=>console.error(err))
  }
  let getCourse = async (mode)=>{
          let nowXNXQ ="http://kjjw.ctgu.edu.cn/jwapp/sys/xnxqcx.do"
          let course = "http://kjjw.ctgu.edu.cn/jwapp/sys/wdkb/modules/xskcb/xskcb.do"
          let showApp = "/appShow?appId=4770397878132218" //我的课表appid
console.log(await req("get",null,showApp))
          await fetch(showApp,{method:"get"}).then(v=>v).then(v=>v.text())
          let xnxq = !document.getElementById('dqxnxq2')?(await req("post",null,nowXNXQ)).datas.dqxnxq.rows[0].DM:document.getElementById('dqxnxq2').getAttribute('value')
          console.log(xnxq)
          let courseText = (await req("post","XNXQDM="+xnxq,course)).datas.xskcb.rows
          console.log(courseText)
         return JSON.stringify({'courseJson':courseText,'mode':mode})
  }
  function AIScheduleLoading({
      titleText='加载中',
      contentText = 'loading...',
  }={}
  ){
      console.log("start......")
      AIScheduleComponents.addMeta()
      const title = AIScheduleComponents.createTitle(titleText)
      const content = AIScheduleComponents.createContent(contentText)
      const card = AIScheduleComponents.createCard([title, content])
      const mask = AIScheduleComponents.createMask(card)
      
      let dyn 
      let count = 0
      function dynLoading(){
          let t = ['loading','loading.','loading..','loading...']
          if(count==4) count=0
          content.innerText = t[count++]
      }

      this.show=()=>{ 
          console.log("show......")
          document.body.appendChild(mask)
          dyn = setInterval(dynLoading,1000);
      }
      this.close=()=>{
          document.body.removeChild(mask)
          clearInterval(dyn)
      }
      }
  async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
      //除函数名外都可编辑
      //以下为示例，您可以完全重写或在此基础上更改
      await loadTool('AIScheduleTools')
    
      try{
           let mode = (await AIScheduleSelect({
              titleText:"导入模式选择",
              contentText:"请选择导入模式",
              selectList:[
                  "模式一:解析当前页面（速度快）",
                  "模式二:请求接口（速度慢）"
              ]
          })).split(':')[0]

          if(mode=='模式一'){
              return JSON.stringify({'html':dom.getElementById("kcb_container").outerHTML,'mode':mode})
          }
          else if(mode=='模式二'){
              let loading = new AIScheduleLoading()
              loading.show()
              let res = await getCourse(mode)
              loading.close()
          return res
          }
      }catch(e){
          console.error(e)
          try{
              let loading = new AIScheduleLoading()
              loading.show()
              let res = await getCourse("模式二")
             loading.close()
              return res
          }catch(e){
              await AIScheduleAlert({
                  contentText: e,
                  titleText: '错误',
                  confirmText: '导入失败',
                })
              return "do not continue"
          }
          
      }
  }
function resolveCourseConflicts(result) {
  let splitTag="&"
//将课拆成单节，并去重
  let allResultSet = new Set()
  result.forEach(singleCourse => {
      singleCourse.weeks.forEach(week => {
          singleCourse.sections.forEach(value => {
              let course = {sections: [], weeks: []}
              course.name = singleCourse.name;
              course.teacher = singleCourse.teacher==undefined?"":singleCourse.teacher;
              course.position = singleCourse.position==undefined?"":singleCourse.position;
              course.day = singleCourse.day;
              course.weeks.push(week);
              course.sections.push(value);
              allResultSet.add(JSON.stringify(course));
          })
      })
  })
  let allResult = JSON.parse("[" + Array.from(allResultSet).toString() + "]").sort(function (a, b) {
      //return b.day - e.day;
      return (a.day - b.day)||(a.sections[0]-b.sections[0]);
  })

  //将冲突的课程进行合并
  let contractResult = [];
  while (allResult.length !== 0) {
      let firstCourse = allResult.shift();
      if (firstCourse == undefined) continue;
      let weekTag = firstCourse.day;
   //   console.log(firstCourse)
      for (let i = 0; allResult[i] !== undefined && weekTag === allResult[i].day; i++) {
          if (firstCourse.weeks[0] === allResult[i].weeks[0]) {
              if (firstCourse.sections[0] === allResult[i].sections[0]) {
                  let index = firstCourse.name.split(splitTag).indexOf(allResult[i].name);
                  if (index === -1) {
                      firstCourse.name += splitTag + allResult[i].name;
                      firstCourse.teacher += splitTag + allResult[i].teacher;
                      firstCourse.position += splitTag + allResult[i].position;
                     // firstCourse.position = firstCourse.position.replace(/undefined/g, '')
                      allResult.splice(i, 1);
                      i--;
                  } else {
                      let teacher = firstCourse.teacher.split(splitTag);
                      let position = firstCourse.position.split(splitTag);
                      teacher[index] = teacher[index] === allResult[i].teacher ? teacher[index] : teacher[index] + "," + allResult[i].teacher;
                      position[index] = position[index] === allResult[i].position ? position[index] : position[index] + "," + allResult[i].position;
                      firstCourse.teacher = teacher.join(splitTag);
                      firstCourse.position = position.join(splitTag);
                     // firstCourse.position = firstCourse.position.replace(/undefined/g, '');
                      allResult.splice(i, 1);
                      i--;
                  }

              }
          }
      }
      contractResult.push(firstCourse);
  }
  //将每一天内的课程进行合并
  let finallyResult = []
  while (contractResult.length != 0) {
      let firstCourse = contractResult.shift();
      if (firstCourse == undefined) continue;
      let weekTag = firstCourse.day;
      for (let i = 0; contractResult[i] !== undefined && weekTag === contractResult[i].day; i++) {
          if (firstCourse.weeks[0] === contractResult[i].weeks[0] && firstCourse.name === contractResult[i].name && firstCourse.position === contractResult[i].position && firstCourse.teacher === contractResult[i].teacher) {
              if (firstCourse.sections[firstCourse.sections.length - 1] + 1 === contractResult[i].sections[0]) {
                  firstCourse.sections.push(contractResult[i].sections[0]);
                  contractResult.splice(i, 1);
                  i--;
              } else break
              // delete (contractResult[i])
          }
      }
      finallyResult.push(firstCourse);
  }
  //将课程的周次进行合并
  contractResult = JSON.parse(JSON.stringify(finallyResult));
  finallyResult.length = 0;
  while (contractResult.length != 0) {
      let firstCourse = contractResult.shift();
      if (firstCourse == undefined) continue;
      let weekTag = firstCourse.day;
      for (let i = 0; contractResult[i] !== undefined && weekTag === contractResult[i].day; i++) {
          if (firstCourse.sections.sort((a,b)=>a-b).toString()=== contractResult[i].sections.sort((a,b)=>a-b).toString() && firstCourse.name === contractResult[i].name && firstCourse.position === contractResult[i].position && firstCourse.teacher === contractResult[i].teacher) {
              firstCourse.weeks.push(contractResult[i].weeks[0]);
              contractResult.splice(i, 1);
              i--;
          }
      }
      finallyResult.push(firstCourse);
  }
  console.log(finallyResult);
  return finallyResult;
}
function getWeeks(Str) {
  function range(con, tag) {
      let retWeek=[]
      con.slice(0, -1).split(',').forEach(w => {
          let tt = w.split('-')
          let start = parseInt(tt[0])
          let end = parseInt(tt[tt.length - 1])
          if (tag == 1 || tag == 2)    retWeek.push(...Array(end + 1 - start).fill(start).map((x, y) => x + y).filter(f=>{return f%tag==0}))
          else retWeek.push(...Array(end + 1 - start).fill(start).map((x, y) => x + y).filter(v => {return v % 2 != 0    }))
      })
      return retWeek
  }
  Str = Str.replace(/[(){}|第]/g, "").replace(/到/g, "-")
  let reWeek = [];
  let week1 = []
  while (Str.search(/周/) != -1) {
      let index = Str.search(/周/)
      if (Str[index + 1] == '单' || Str[index + 1] == '双') {
          week1.push(Str.slice(0, index + 2).replace("周", ""));
          index += 2
      } else {
          week1.push(Str.slice(0, index + 1).replace("周", ""));
          index += 1
      }

      Str = Str.slice(index)
      index = Str.search(/\d/)
      if (index != -1) Str = Str.slice(index)
      else Str = ""

  }
  if (Str.length != 0) week1.push(Str)

  week1.forEach(v => {
      console.log(v)
      if (v.slice(-1) == "双") reWeek.push(...range(v, 2))
      else if (v.slice(-1) == "单") reWeek.push(...range(v, 3))
      else reWeek.push(...range(v+"全", 1))
  });
  return reWeek;
}
function getJc(Str){
  let jc = []
  Str = Str.replace(/第|节/g,"")
  let Strar = Str.split("-")
  for(i=Number(Strar[0]);i<=Strar[Strar.length-1];i++){
      jc.push(i)
  }
  return jc
}
function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
  //以下为示例，您可以完全重写或在此基础上更改
  let result = []
  let message = ""
  try{
      let jsonData = JSON.parse(html);
      if(jsonData.mode=='模式一'){
          let $ = cheerio.load(jsonData.html, {decodeEntities: false})
          let tbody = $('table[class = wut_table] tbody')
          let trs = tbody.find('tr')
          trs.each(function (inde, em) {
              let tds = $(this).find("td[data-role=item]")
              tds.each(function (ind, emmm) {
                  let div = $(this).find('.mtt_arrange_item')
                  div.each(function (indexx, eem) {
                      console.log($(this).find('.mtt_item_kcmc').eq(0).find('a').length)
                      if ($(this).find('.mtt_item_kcmc').eq(0).find('a').length != 0) return;
                      let re = {weeks: [], sections: []}
                      let namet = $(this).find('.mtt_item_kcmc').eq(0).text()
                      let name = namet.match(/(?<=([A-Z]|\d)*\s).*?(?=\[)/)
                      if (name == null) name = namet.split(/\[|\$|\s/)
                      re.name = name[0]
                      re.teacher = $(this).find('.mtt_item_jxbmc').eq(0).text()
                      let jskc = $(this).find('.mtt_item_room').eq(0).text()
                      let jskcar = jskc.split(",")
                      re.position = jskcar[jskcar.length - 1]
                      jskcar.pop()
                      re.sections = getJc(jskcar[jskcar.length - 1])
                      jskcar.pop()
                      re.day = jskcar[jskcar.length - 1].replace("星期", "")
                      re.day = parseInt(re.day)
                      jskcar.pop()
                      let zcstr = jskcar.toString()
                      re.weeks = getWeeks(zcstr)
                      result.push(re)
                  })
              })
          })
      }else if(jsonData.mode=='模式二'){
          let courses = jsonData.courseJson
          courses.forEach(course=>{
              result.push({
                  "name":course.KCM+(!course.TYXMDM_DISPLAY?"":`(${course.TYXMDM_DISPLAY})`),
                  "teacher":course.SKJS,
                  'position':course.JASMC,
                  'sections':(()=>{
                      let start = course.KSJC
                      let end = course.JSJC
                      let sec=[]
                      for(let i = start;i<=end;i++){
                          sec.push(i)
                      }
                      return sec
                  })(),
                  'weeks':(()=>{
                      let week = []
                      course.SKZC.split("").forEach((em, index) => {
                          if (em == 1) week.push(index+1);
                      })
                     return week
                  })(),
                  'day':course.SKXQ
              })
          })
      }

      if(result.length) result = resolveCourseConflicts(result)
      else message="没有获取到课表"
  }catch(e){
      message = e.message
  }
  if(message.length){
      result.length = 0
      result.push({name:"遇到错误,请加群:628325112,找开发者进行反馈",teacher:"开发者-萧萧",position:message,day:1,weeks:[1],sections:[{section:1},{section:2}]})
  }

  return result
}
function getTimes(xJConf, dJConf) {
// 如果未提供冬季时间配置，则使用夏季时间配置
dJConf = dJConf === undefined ? xJConf : dJConf;

// 计算课程时间表的函数
function getTime(conf) {
  const courseSum = conf.courseSum; // 课程总节数
  const startTime = conf.startTime; // 上课时间，格式为 HHMM
  const oneCourseTime = conf.oneCourseTime; // 每节课时长，单位分钟
  const shortRestingTime = conf.shortRestingTime; // 短休息时间，单位分钟

  const longRestingTimeBegin = conf.longRestingTimeBegin; // 长休息开始节次
  const longRestingTime = conf.longRestingTime; // 长休息时间，单位分钟
  const lunchTime = conf.lunchTime; // 午休时间
  const dinnerTime = conf.dinnerTime; // 晚餐时间
  const abnormalClassTime = conf.abnormalClassTime; // 特殊课程时间
  const abnormalRestingTime = conf.abnormalRestingTime; // 特殊休息时间

  const result = [];
  let studyOrRestTag = true;
  let timeSum = parseInt(startTime.slice(0, 2)) * 60 + parseInt(startTime.slice(2));

  const classTimeMap = new Map();
  const RestingTimeMap = new Map();

  // 处理特殊课程时间
  if (abnormalClassTime !== undefined) {
    abnormalClassTime.forEach(time => {
      classTimeMap.set(time.begin, time.time);
    });
  }

  // 处理长休息时间
  if (longRestingTimeBegin !== undefined) {
    longRestingTimeBegin.forEach(time => {
      RestingTimeMap.set(time, longRestingTime);
    });
  }

  // 处理午休和晚餐时间
  if (lunchTime !== undefined) {
    RestingTimeMap.set(lunchTime.begin, lunchTime.time);
  }
  if (dinnerTime !== undefined) {
    RestingTimeMap.set(dinnerTime.begin, dinnerTime.time);
  }

  // 处理特殊休息时间
  if (abnormalRestingTime !== undefined) {
    abnormalRestingTime.forEach(time => {
      RestingTimeMap.set(time.begin, time.time);
    });
  }

  // 生成课程时间表
  for (let i = 1, j = 1; i <= courseSum * 2; i++) {
    if (studyOrRestTag) {
      const startTimeFormatted = ("0" + Math.floor(timeSum / 60)).slice(-2) + ':' + ('0' + timeSum % 60).slice(-2);
      timeSum += classTimeMap.get(j) === undefined ? oneCourseTime : classTimeMap.get(j);
      const endTimeFormatted = ("0" + Math.floor(timeSum / 60)).slice(-2) + ':' + ('0' + timeSum % 60).slice(-2);

      studyOrRestTag = false;

      result.push({
        section: j++,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted
      });
    } else {
      const restTime = RestingTimeMap.get(j - 1) === undefined ? shortRestingTime : RestingTimeMap.get(j - 1);
      timeSum += restTime;
      studyOrRestTag = true;
    }
  }

  return result;
}

// 获取当前日期
const nowDate = new Date();
const year = nowDate.getFullYear();

// 定义节假日日期
const wuYi = new Date(year + "/05/01");
const jiuSanLing = new Date(year + "/09/30");
const shiYi = new Date(year + "/10/01");
const nextSiSanLing = new Date((year + 1) + "/04/30");
const previousShiYi = new Date((year - 1) + "/10/01");
const siSanLing = new Date(year + "/04/30");

// 获取夏季和冬季时间表
const xJTimes = getTime(xJConf);
const dJTimes = getTime(dJConf);

// 根据当前日期选择使用夏季或冬季时间表
if (nowDate >= wuYi && nowDate <= jiuSanLing) {
  return xJTimes;
} else if ((nowDate >= shiYi && nowDate <= nextSiSanLing) || (nowDate >= previousShiYi && nowDate <= siSanLing)) {
  return dJTimes;
}
}