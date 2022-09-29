import { useGlobalIconFont } from './components/iconfont/helper';

export default {
	usingComponents: Object.assign(useGlobalIconFont()),
	requiredBackgroundModes: ['audio'],
	pages: [
		'pages/home/index',
		
		'pages/course/category',
		'pages/discovery/discovery',
		'pages/study/study',
		
		'pages/user/user',
		'pages/user/passport'
	],
	subPackages: [
		{
			root: "v2",
			pages: [
				'pages/base/web',
				'pages/base/comment/comment',
				'pages/base/comment/publish',

				'pages/home/search',

				'pages/course/channel',
				'pages/course/vod',
				'pages/course/related',
				'pages/course/audio',
				'pages/course/live',
				'pages/course/liveChannel',
				'pages/course/article',
				'pages/course/articleChannel',
				'pages/course/order',
				'pages/course/livePay',
				
				'pages/teacher/teacher',
				'pages/teacher/teacherChannel',

				'pages/discovery/special',
				'pages/discovery/squad',
				'pages/discovery/activity/activity',
				'pages/discovery/activity/work',
				'pages/discovery/activity/paper',
				'pages/discovery/activity/join',

				'pages/study/rank',
				'pages/study/map',
				'pages/study/mapChannel',
				'pages/study/plan',
				'pages/study/planChannel',
				'pages/study/paper',
				'pages/study/paperDone',

				'pages/news/news',
				'pages/news/newsChannel',

				'pages/group/groupChannel',
				'pages/group/group',
				'pages/group/publish',
				'pages/group/groupOn',
				'pages/group/member',
				
				'pages/ask/askChannel',
				'pages/ask/ask',
				'pages/ask/publish',
				'pages/ask/reply',
				'pages/ask/invite',

				'pages/user/account',
				'pages/user/nickname',
				'pages/user/grow/grow',
				'pages/user/grow/right',
				'pages/user/collect',
				'pages/user/follow',
				'pages/user/course',
				'pages/user/study',
				'pages/user/exam/test',
				'pages/user/exam/wrong',
				'pages/user/integral',
				'pages/user/recharge',
				'pages/user/squad',
				'pages/user/task',
				'pages/user/ask',
				'pages/user/cert',
				'pages/user/medal/medal',
				'pages/user/medal/info',
				'pages/user/qr',
				'pages/user/feedback',

				'pages/user/message/message',
				'pages/user/message/info',

				'pages/user/teacher/rule',
				'pages/user/teacher/medal',
				'pages/user/teacher/apply',
				'pages/user/teacher/corp',

				'pages/user/address/address',
				'pages/user/address/publish',

				'pages/user/lucky/lucky',
				'pages/user/lucky/rule',
				'pages/user/lucky/record',

				'pages/user/about/about',
				'pages/user/about/content',
			]
		}
	],
	window: {
		backgroundTextStyle: 'light',
		navigationBarBackgroundColor: '#fff',
		navigationBarTitleText: '纳视界',
		navigationBarTextStyle: 'black'
	},
	tabBar: {
		color: "#999999",
		selectedColor: "#00A6F6",
		list: [
			{
				pagePath: 'pages/home/index',
				text: '首页',
				iconPath: './asset/home/tab.png',
                selectedIconPath: './asset/home/tab.on.png',
			},
			{
				pagePath: 'pages/course/category',
				text: '资源',
				iconPath: './asset/course/tab.png',
                selectedIconPath: './asset/course/tab.on.png',
			},
			{
				pagePath: 'pages/discovery/discovery',
				text: '发现',
				iconPath: './asset/discovery/tab.png',
                selectedIconPath: './asset/discovery/tab.on.png',
			},
			{
				pagePath: 'pages/study/study',
				text: '学习',
				iconPath: './asset/study/tab.png',
                selectedIconPath: './asset/study/tab.on.png',
			},
			{
				pagePath: 'pages/user/user',
				text: '我的',
				iconPath: './asset/user/tab.png',
                selectedIconPath: './asset/user/tab.on.png',
			}
		]
	}
}
