import Taro from '@tarojs/taro'
import config from '../config/param'

function filterStatus(response) {
	if (response.statusCode >= 200 && response.statusCode < 300) {
		return response;
	} else {
		let error = new Error(response.errMsg);
		error.response = response;
		error.type = 'http';
		throw error;
	}
}

function filterResult(result) {
	let res  = result.data;
	if (typeof(res) === 'string') {
		res = JSON.parse(res);
	}

	if (res.status) {
		return res.data;
	} else {
		throw res.message;
	}
}

export default {

	get(url, params) {
		url = config.api + url;

		const options = {
			url: url,
			data: params,
			method: 'GET',
			dataType: 'json',
			header: {
				'ORIGIN-PLANT': 'wx',
				'Request-Type': global.utype == 0 ? '' : 'internal',
				'access_token': global.token,
			}
		}
		
		return Taro.request(options).then(filterStatus).then(filterResult);
	},

	post(url, params) {
		url = config.api + url;
        
		const options = {
			url: url,
			data: params,
			method: 'POST',
			dataType: 'json',
			header: {
				'content-type': 'application/x-www-form-urlencoded',
				'ORIGIN-PLANT': 'wx',
				'Request-Type': global.utype == 0 ? '' : 'internal',
				'access_token': global.token,
			}
		}

		return Taro.request(options).then(filterStatus).then(filterResult);
	},

};