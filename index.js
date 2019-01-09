module.exports = function HidePeople(mod) {
	
	let {
		enabled,
		hideParty,
		hideGuild,
		hideBlack,
		hideBlackList,
		instanceList
	} = require('./config.json')
	
	let myGameId,
		myZone,
		myGuildName = [],
		showMembers = [],
		visibleRange,
		partyMembers = []
	
	mod.command.add('屏蔽', (arg) => {
		if (!arg) {
			enabled = !enabled
			refreshPlayer()
			hideStatus()
		} else {
			switch (arg) {
				case '组队':
					hideParty = !hideParty
					refreshPlayer()
					sendMessage('我的组队成员: ' + (hideParty ? BLU('隐藏') : YEL('显示')))
					break
				case '公会':
					hideGuild = !hideGuild
					refreshPlayer()
					sendMessage('我的公会成员: ' + (hideGuild ? BLU('隐藏') : YEL('显示')))
					break
				case '黑单':
					hideBlack = !hideBlack
					refreshPlayer()
					sendMessage('黑单公会玩家: ' + (hideBlack ? BLU('隐藏') : YEL('显示')))
					break
				case '刷新':
					refreshPlayer()
					sendMessage(TIP('刷新显示'))
					break
				case '状态':
					hideStatus()
					break
				default:
					sendMessage(RED('无效的参数!'))
					break
			}
		}
	})
	
	mod.hook('C_SET_VISIBLE_RANGE', 1, cSetVisibleRanga)
	mod.hook('S_LEAVE_PARTY', 1, sLeaveParty)
	mod.hook('S_LOAD_TOPO', 3, sLoadTopo)
	mod.hook('S_LOGIN', 12, sLogin)
	mod.hook('S_FEARMOVE_STAGE', 1, sFearmoveStage)
	mod.hook('S_FEARMOVE_END', 1, sFearmoveEnd)
	mod.hookOnce('S_GET_USER_LIST', 15, sGetUserList)
	mod.hook('S_PARTY_MEMBER_LIST', 7, sPartyMemberList)
	mod.hook('S_SPAWN_USER', 14, sSpawnUser)
	
	function cSetVisibleRanga(event) {
		visibleRange = event.range
	}
	
	function sLeaveParty(event) {
		showMembers = []
		refreshPlayer()
	}
	
	function sLoadTopo(event) {
		myZone = event.zone
	}
	
	function sLogin(event) {
		myGameId = event.gameId
	}
	
	function sFearmoveStage(event) {
		if (enabled) return false
	}
	
	function sFearmoveEnd(event) {
		if (enabled) return false
	}
	
	function sGetUserList(event) {
		for (let character of event.characters) {
			if (!myGuildName.includes(character.guildName) && character.guildName !== '') {
				myGuildName.push(character.guildName)
			}
		}
	}
	
	function sPartyMemberList(event) {
		partyMembers = event.members
		if (enabled && (!instanceList.includes(myZone))) {
			if (showMembers.length == 0) refreshPlayer()
			for (let m of partyMembers) {
				if (m.gameId == myGameId) continue
				else if (!showMembers.includes(m.gameId.toString())) {
					showMembers.push(m.gameId.toString())
				}
			}
		}
	}
	
	function sSpawnUser(event) {
		if (enabled && (!instanceList.includes(myZone))) {
			if ( !hideParty && showMembers.includes(event.gameId.toString()) ) return
			if ( !hideGuild && myGuildName.includes(event.guildName) ) return
			if ( !hideBlack && hideBlackList.includes(event.guildName) ) return
			return false
		}
	}
	
	function refreshPlayer() {
		mod.send('C_SET_VISIBLE_RANGE', 1, {
			range: 1
		})
		setTimeout(() => {
			mod.send('C_SET_VISIBLE_RANGE', 1, {
				range: visibleRange
			})
		}, 1000)
	}
	
	function hideStatus() {
		sendStatus(`模块 ${enabled ? '开启' : '关闭'}`,
			`我的组队成员: ${hideParty ? BLU('隐藏') : YEL('显示')}`,
			`我的公会成员: ${hideGuild ? BLU('隐藏') : YEL('显示')}`,
			`黑单公会玩家: ${hideBlack ? BLU('隐藏') : YEL('显示')}`,
			`黑单公会列表: ${TIP(hideBlackList.toString())}`,
		)
	}
	
	function sendStatus(msg) {
		mod.command.message([...arguments].join('\n\t - '))
	}
	
	function sendMessage(msg) {
		mod.command.message(msg)
	}
	
	function BLU(bluetext) {
		return '<font color="#56B4E9">' + bluetext + '</font>'
	}
	
	function YEL(yellowtext) {
		return '<font color="#E69F00">' + yellowtext + '</font>'
	}
	
	function RED(redtext) {
		return '<font color="#FF0000">' + redtext + '</font>'
	}
	
	function TIP(tipsText) {
		return '<font color="#00FFFF">' + tipsText + '</font>'
	}
	
}
