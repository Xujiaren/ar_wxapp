import request from '../../util/net';
import Taro from '@tarojs/taro'

export function index() {
	return request.get('/site/index', {
	});
}

export function channel(channel_id, sort) {
	return request.get('/site/channel/' + channel_id, {
		sort: sort
	});
}

export function comment(content_id, ctype, sort, page) {
	return request.get('/site/comments/' + content_id, {
		ctype: ctype,
		sort: sort,
		page: page,
	});
}

export function upload({file}) {
	return request.post('/site/upload', {
		file:file,
	});
}

export function clearHistory({index}) {
	try {
		let history = Taro.getStorageSync('search') || []
		history.splice(index, 1)
		return Taro.setStorage({
			key: 'search',
			data: history
		})
	} catch (e) {
		
	}
}

export function clearAllHistory() {
	return Taro.removeStorage({
		key: 'search',
	})
}

export function history() {
	return Taro.getStorage({
		key: 'search',
	});
}

export function search(keyword) {
	try {
		let history = Taro.getStorageSync('search') || []
		if (history.indexOf(keyword) == -1) {
			history.push(keyword)
		}

		Taro.setStorageSync('search', history)
	} catch (e) {
		
	}

	return request.get('/site/search', {
		keyword: keyword,
	});
}