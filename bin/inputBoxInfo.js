const {
    AREANO,
    BOXNO_0003,
    BOXNO_00,
    BOXNO_0004,
    LOCKERNO_00,
    LOCKERNO_0003,
    LOCKERNO_0004
} = require('../const')
const WordTable = require('word-table')



class InputBoxInfo {
    constructor(type) {
        this.type = type || '00'
        this.createMap()
    }
    createMap() {
        let room_00, room_0003, room_0004
        AREANO.forEach((item, index) => {
            if (index === 0 && this.type == '00') {
                room_00 = this.createHeader(item.tAreaName)
                console.log(room_00)
                this.createTable(index)
            } else if (index === 1 && this.type == '0003') {
                room_0003 = this.createHeader(item.tAreaName)
                console.log(room_0003)
                this.createTable(index)
            } else if (index === 2 && this.type == '0004') {
                room_0004 = this.createHeader(item.tAreaName)
                console.log(room_0004)
                this.createTable(index)
            }
        })
    }
    createTable(index) {
        if (index === 0) {
            let header = ['柜号', '箱号']
            let body = InputBoxInfo.createMapLocker(LOCKERNO_00, BOXNO_00)
            let wt = new WordTable(header, body)
            console.log(wt.string())
        } else if (index === 1) {
            let header = ['柜号', '箱号']
            let body = InputBoxInfo.createMapLocker(LOCKERNO_0003, BOXNO_0003)
            let wt = new WordTable(header, body)
            console.log(wt.string())
        } else if (index === 2) {
            let header = ['柜号', '箱号']
            let body = InputBoxInfo.createMapLocker(LOCKERNO_0004, BOXNO_0004)
            let wt = new WordTable(header, body)
            console.log(wt.string())
        }
    }
    createHeader(tAreaName) {
        return `
                _______________________________________________________________________
                |                                                                      |
                |                            ${tAreaName}                                |
                |______________________________________________________________________|

            `
    }
    static createMapLocker (LOCKERNO, BOXNO) {
        let result = []
        LOCKERNO.forEach((item) => {
            result.push(
                [`lockerId<${item.lockerId}>/areaNo<${item.areaNo}>/lockerNo<${item.lockerNo}>`, ...BOXNO[item.lockerId].map((node) => {
                    return `boxNo<${node.boxNo}>`
                })]
            )
        })
        return result
    }
}

module.exports = InputBoxInfo