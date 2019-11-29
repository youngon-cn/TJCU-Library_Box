#!/usr/bin/env node

const program = require('commander')
const consola = require('consola')
const subscribeBox = require('./subscribeBox')
const inputBoxInfo = require('./inputBoxInfo')
program
    .version(require('../package').version)
    .option('-B, --box <type>', '查看不同楼层的不同柜子信息')
    .option('-U, --user <user>', '用户(电话):密码 <phone:password>')
    .option('-S, --sark <sark>', '柜子 <areaNo:lockerNo:lockerId:boxNo;> 支持多个')
    .option('-I, --immediately', '立刻执行')
    .parse(process.argv);

if (!program.box && !program.user && !program.sark) return consola.info('参数不正确，请输入 box -h 查看😊')
if ((program.user && !program.sark) ||
    (!program.user && program.sark)
) return consola.info('--user 和 --sark 必须同时存在，请输入 box -h 查看😊')
if (program.box) {
    if (String(program.box) !== '00' && program.box !== '0003' && program.box !== '0004') {
        return consola.info(`
            参数类型错误，请输入表格类型
            ——————————————————————————————————————————————————
            | 00 _________|  0003 _________|  0004 __________|
            |             |                |                 |
            | 图书馆三楼  |  图书馆四楼    |  图书馆五楼     |
            |________________________________________________|
            
        `)
    }
    new inputBoxInfo(program.box)
}
if (program.user && program.sark) {
    new subscribeBox({user: program.user, sark: program.sark, immediately: program.immediately})
}