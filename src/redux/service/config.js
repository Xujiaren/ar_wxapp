import request from '../../util/net';
import Taro from '@tarojs/taro'

export function config() {
	return request.get('/config', {
	});
}

export function oss() {
	return request.get('/site/oss', {
	});
}

export function ad(ad_id) {
	return request.get('/config/ad/' + ad_id, {
	});
}

export function categoryAsk() {
	return request.get('/config/category/ask', {
	});
}

export function categoryCourse() {
	return request.get('/config/category/course', {
	});
}

export function categoryFeedback() {
	return request.get('/config/category/feedback', {
	});
}

export function gift(gtype) {
	return request.get('/config/gift', {
		gtype: gtype,
	});
}

export function recharge() {
	return request.get('/config/recharge/package', {
		
	});
}

export function tip() {
	global.tip = 0;
	Taro.setStorageSync('tip', 1);
}