const {
    getCookie,
    login,
    subscribe
} = require('./index')
const {
    BOXNO_0003,
    BOXNO_00,
    BOXNO_0004,
    LOCKERNO_00,
    LOCKERNO_0003,
    LOCKERNO_0004
} = require('../const')
const inputBoxInfo = require('./inputBoxInfo')
const consola = require('consola')
const schedule = require('node-schedule')
const process = require('child_process')
const dayJs = require('dayjs')

class SubscribeBox {
    constructor(options) {
        this.user = options.user.split(':')
        this.sark = options.sark.split(';').map((item) => item.split(':'))
        this.immediately = options.immediately
        this.loginStatus = false // 登陆状态
        this.isSubscribe = false // 预约状态
        this.isSubscribeOther = false // 预约其他位置状态
        if (this.checkOptions()) return
        getCookie().then((cookie) => {
            this.cookie = cookie
            if (this.immediately) {
                this.immediatelySubscribeBox()
            } else {
                this.onTimeSubscribeBox()
            }
        })
    }
    checkOptions() {
        if (this.sark.some((item) => {
                return item.length !== 4
            })) {
            consola.info(`
              Sorry: 您输入的信息和所需的信息不匹配，请查看是否是下面要求
              ____________________________________________________________
              |  areaNo      |   lockerNo    |   lockerId   |  boxNo     |
              |_____1________|______2________|_______3______|_____4______|
              |____________ 可输入 box -B <type> 查看具体箱子信息 _______|
              |                                                          |
              |         2: 请查看您的输入是否在英文环境下                |
              |__________________________________________________________|
              |                                                          |
              |         3: 请查看您的输入格式是否为每个箱位 ';'          |
              |            箱位之间 ':' 分割                             |
              |            具体请输入 box -h 查看                        |
              |__________________________________________________________|
            `)
            return true
        }
    }
    immediatelySubscribeBox() {
        if (this.loginStatus) return this.subscribeWantBox()
        login({
            cookie: this.cookie,
            phone: this.user[0],
            password: this.user[1]
        }).then(() => {
            this.loginStatus = true
            this.subscribeWantBox()
        })
    }
    async subscribeWantBox() {
        let subscribeArr = []
        this.sark.forEach((item) => {
            let areaName = item[0] == '00' ? '图书馆三楼' : item[0] == '0003' ? '图书馆四楼' : '图书馆五楼'
            subscribeArr.push(
                subscribe({
                    areaNo: item[0],
                    lockerNo: item[1],
                    boxNo: item[3],
                    lockerId: item[2],
                    areaName,
                    cookie: this.cookie,
                    user: this.user
                })
            )
        })
        const subscribeResult = await Promise.all(subscribeArr)
        if (this.checkIsSubscribeResult(subscribeResult)) {
            this.createSubscribeOtherBox()
        }
    }
    checkIsSubscribeResult(result) {
        // 如果状态为 1 或者 4 说明已经预约成功
        if (result.indexOf(1) !== -1 || result.indexOf(4) !== -1) {
            this.isSubscribe = true
            this.isSubscribeOther = true
            return false
            // 如果状态里面存在 3, -1, 5 说明没有预约的必要，根据提示操作
        } else if (result.indexOf(3) !== -1 || result.indexOf(0) !== -1 || result.indexOf(5) !== -1) {
            if (result.indexOf(0) !== -1) { this.loginStatus = false }
            return false
            // 否则就是箱子已经被预约，所有去预约其他箱子
        } else {
            consola.info(`😂 您想预约的箱子已经被预约了，我将为您去预约其他可能的箱子`)
            return true
        }
    }
    createSubscribeOtherBox() {
        this.subscribeOtherBox(inputBoxInfo.createMapLocker(LOCKERNO_00, BOXNO_00))
        this.isSubscribe || this.subscribeOtherBox(inputBoxInfo.createMapLocker(LOCKERNO_0003, BOXNO_0003))
        this.isSubscribe || this.subscribeOtherBox(inputBoxInfo.createMapLocker(LOCKERNO_0004, BOXNO_0004))
    }
    async subscribeOtherBox (boxInfoArr, index) {
        let idx = index || 0
        if (this.isSubscribe == true) return consola.info(`😂 您已经预约成功了`)
        boxInfoArr[idx]? await this.subscribeOther(boxInfoArr[idx], idx, boxInfoArr): null
    }
    async subscribeOther (boxInfo, idx, boxInfoArr) {
        let subArr = []
        let info = boxInfo[0].split('/').map((item) => {
            return item.match(/<([0-9]+)>/)[1]
        })
        let areaName = info[1] == '00' ? '图书馆三楼' : info[1] == '0003' ? '图书馆四楼' : '图书馆五楼'
        boxInfo.forEach((item, index) => {
            if (!item.match(/<([0-9]+)>/) || !index) {
                return
            } else {
                subArr.push(
                    subscribe({
                        areaNo: info[1],
                        lockerNo: info[2],
                        boxNo: item.match(/<([0-9]+)>/)[1],
                        lockerId: info[0],
                        areaName,
                        cookie: this.cookie,
                        user: this.user
                    })
                )
            }
        })
        if (this.checkIsSubscribeResult(await Promise.all(subArr))) {
            this.subscribeOtherBox(boxInfoArr, idx + 1)
        }
    }
    onTimeSubscribeBox() {
        this.inputTimer()
        this.consoleLogBless()
        schedule.scheduleJob('0 * * * * *', () => {  
            this.inputTimer()
        })
        schedule.scheduleJob('2 55 12 * * 0', () => {
            setTimeout(() => {
                consola.info(`正在为您更新最新版本....`)
            })
            this.installLibraryMaxVersion()
        })
        schedule.scheduleJob('0 59 12 * * 0', () => {  
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('10 59 12 * * 0', () => {  
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('30 59 12 * * 0', () => {  
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('50 59 12 * * 0', () => {  
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('0 0 13 * * 0', () => {  
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('2 0 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('4 0 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('8 0 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('16 0 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('32 0 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('50 0 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('0 1 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('30 1 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('0 2 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('0 3 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
        schedule.scheduleJob('0 4 13 * * 0', () => {
            if (!this.isSubscribe) this.immediatelySubscribeBox()
        })
    }
    installLibraryMaxVersion () {
        process.exec('npm install tjcu_box -g', (err, stdout, stderr) => {
            if (err) return consola.info(`版本更新失败`)
            consola.info(`版本更新成功`)
        })
    }
    consoleLogBless () {
        let {month, date, day} = this.getNowTimer()
        if (month + 1 == 12 && (date >= 15 || date <= 23)) {
            consola.info(`
            愿历尽千帆  归来仍少年
                        -- XXX <${month + 1}月/${date}日/星期${day? day: '日'}>
        `)
        }
    }
    inputTimer() {
        let {month, date, day, hour, minute, second} = this.getNowTimer()
        let info
        if (day) {
            info = `今天是 星期 ${day? day: '日'} 距离周日还有 ${7 - day} 天，周日在来尝试吧`
        } else {
            if (hour > 13 && minute > 5) {
                info = `您好像已经错过了预约时间😭，下个周再来尝试吧`
            } else if (hour == 12 && minute == 59) {
                info = `程序开始约箱子 please wait.... <程序运行中可能出现错误，请不要理会，原因!!后端服务器错误，短时间内高并发造成>`
            } else if ((hour == 12 && minute > 59) || (hour == 13 && minute < 5)) {
            } else if (hour == 13 && minute == 5) {
                info = `程序已经完成约箱子流程 please you see input log or login TJCU library see record`
            } else if (hour < 13) {
                hour == 12? info = `您距离预约时间还差 ${60 - minute} 分钟, 预约箱子${60 - minute < 5? '即将': '将要'}开始`: info = `您距离预约时间还差 ${13 - hour - 1}小时/${60 - minute}分钟`
            } else {
                info = `程序已经运行完成，请查看你的结果`
            }
        }
        consola.info(`
            现在是本地时间 ${month + 1}月/${date}日/星期${day? day: '日'}/${hour}:${minute}:${second}
            ${info}
        `)
    }
    getNowTimer () {
        let Timer = dayJs(new Date())
        let month = Timer.month()
        let date = Timer.date()
        let day = Timer.day()
        let hour = Timer.hour()
        let minute = Timer.minute()
        let second = Timer.second()
        return {month, date, day, hour, minute, second}
    }
}


module.exports = SubscribeBox