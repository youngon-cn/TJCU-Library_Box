const $ = require('superagent');
const consola = require('consola');

/**
 * 
 * @function getAreaNo        获取盒子所在的楼层
 * @function getLockerNo      获取楼层盒子所在柜子
 * @function getBoxNo         获取楼层盒子柜子
 * 
 */



function getCookie() {
    return new Promise((resolve, reject) => {
        $.get('http://libcbg.tjcu.edu.cn:8080/tjcu/student.do')
            .then((res) => {
                if (res.header['set-cookie'][0]) return resolve(res.header['set-cookie'][0].split(';')[0])
                consola.info('获取Cookie失败') && reject(false)
            }).catch((e) => {
                consola.error(`请查看您的网络是否为校园网` + '\n' + e)
            })
    })
}



function login({
    cookie,
    phone,
    password
}) {
    return new Promise((resolve, reject) => {
        $.post('http://libcbg.tjcu.edu.cn:8080/tjcu/student/login.do')
            .set('Cookie', `${cookie}`)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0')
            .send({
                phone,
                password
            })
            .then((res) => {
                let code = Number(res.text)
                if (code === 1) {
                    resolve()
                    consola.success('登陆成功')
                } else if (code === 0) {
                    consola.info('用户名错误 <电话错误>')
                } else if (code === -1) {
                    consola.info('密码错误')
                } else if (code === -2) {
                    reject(code)
                    consola.info('登陆失败')
                } else {
                    reject(false)
                }
            }).catch((e) => {
                consola.error(e) && reject(false)
            })
    })
}

function subscribe({
    areaNo,
    lockerNo,
    boxNo,
    lockerId,
    areaName,
    cookie,
    user
}) {
    // console.log(`areaNo${areaNo}lockerNo${lockerNo}boxNo${boxNo}lockerId${lockerId}areaName${areaName}` )
    return new Promise((resolve, reject) => {
        $.post('http://libcbg.tjcu.edu.cn:8080/tjcu/student/reserve.do')
            .set('Cookie', `${cookie}`)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0')
            .send({
                areaNo,
                lockerNo,
                boxNo,
                lockerId,
                areaName,
            })
            .on('error', (err) => {
                if (err && err.status === 500) {
                    consola.info('服务器请求错误，请不要理会，原因!!后端服务器错误，短时间内高并发造成') 
                } else if (err && (
                    err.status === 404 || err.status === 301 ||
                    err.status === 302 || err.status === 304 ||
                    err.status === 403
                )) {
                    consola.info('服务器可能已经发现占箱程序的存在，请联系开发者更新版本。微信: <t14785999950>') 
                } else {
                    consola.info('服务器出现问题，请不要理会')
                }
            })
            .then((res) => {
                let code = Number(res.text)
                if (code === 1) {
                    resolve(code)
                    consola.success(`恭喜你啊 <😜> 约箱成功
                        ________________________________________________________________
                        |                                                               |
                        |    箱子信息  |       ${areaName}/${lockerNo}/${boxNo}          |
                        |_______________________________________________________________|
                        |                                                               |
                        |   查询网址   |  http://libcbg.tjcu.edu.cn:8080/tjcu/student.do |
                        |_______________________________________________________________|        
                    `)
                } else if (code === 0) {
                    resolve(code)
                    consola.info('未登录，请重启程序') 
                } else if (code === 2) {
                    resolve(code)
                    consola.info(`${areaName}/${lockerNo}/${boxNo} <此箱号已被预约>`)
                } else if (code === 3) {
                    resolve(code)
                    consola.info(`当前时间不可预约 <${areaName}/${lockerNo}/${boxNo}>`) 
                } else if (code === 4) {
                    resolve(code)
                    consola.info(`${user[0]} 当前账户已经预约`) 
                } else if (code === 5) {
                    resolve(code)
                    consola.info('系统异常')
                }
            }).catch((e) => {
                consola.error(e) && reject(false)
            })
    })
}


/**
 *  @returns (Array) --> ./const/AREANO.JS
 */

function getAreaNo() {
    return new Promise((resolve, reject) => {
        $.get(`http://libcbg.tjcu.edu.cn:8080/tjcu/student/getAreaNo.do?_=${Date.now()}`)
            .then((res) => {
                if (res.body.length) return resolve(res.body)
                consola.info('获取楼层失败') && reject(false)
            }).catch((e) => {
                consola.error(e) && reject(false)
            })
    })
}

/**
 *  @returns (Array) --> ./const/LOCKERO_/[0-9]${n}/
 */

function getLockerNo(areaNo) {
    return new Promise((resolve, reject) => {
        $.get(`http://libcbg.tjcu.edu.cn:8080/tjcu/student/getLockerNo.do?areaNo=${areaNo}&_=${Date.now()}`)
            .then((res) => {
                if (res.body.length) return resolve(res.body)
                consola.info('获取楼层柜子失败') && reject(false)
            }).catch((e) => {
                consola.error(e) && reject(false)
            })
    })
}

/**
 *  @returns (Array) --> ./const/BOXNO_/[0-9]${n}/
 */

function getBoxNo(lockerId) {
    return new Promise((resolve, reject) => {
        $.get(`http://libcbg.tjcu.edu.cn:8080/tjcu/student/getBoxNo.do?lockerId=${lockerId}&_=${Date.now()}`)
            .then((res) => {
                if (res.body.list.length) return resolve(res.body)
                consola.info('获取楼层柜子箱子失败') && reject(false)
            }).catch((e) => {
                consola.error(e) && reject(false)
            })
    })
}


// Test Cookie
// getCookie().then((Cookie) => {
//    console.log(Cookie)
// })

// Test 获取盒子楼层
// getAreaNo()

// Test 获取盒子柜号
// getLockerNo('0004')

// Test 获取箱子号
// getBoxNo('18060146')

module.exports = {
    getCookie,
    login,
    getAreaNo,
    getLockerNo,
    getBoxNo,
    subscribe
}