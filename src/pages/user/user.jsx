import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../util/connect'
import IconFont from '../../components/iconfont'
import asset from '../../config/asset'
import * as tool from '../../util/tool'
import './user.less'

class User extends Component {

	state = {
		unread: 0,
		teacher: false,
		utype: 0,
		refresh: false,
	}

	componentDidShow() {
		
		this.setState({
			utype: global.utype,
		})

		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {user, unread} = nextProps;

        if (user !== this.props.user) {
            global.uid = user.userId;
            this.setState({
                teacher: user.teacher,
            })
        }

        if (unread !== this.props.unread) {
            this.setState({
                unread: unread.message + unread.remind,
            })
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
        actions.user.unread();

		this.setState({
			refresh: true,
		})
    }

	onAction = (action, args) => {
		const {user} = this.props;

		if (!user.userId) {
            Taro.navigateTo({
				url: '/pages/user/passport'
			})
        } else {
			if (action == 'scan') {
				this.onScan()
			} else if (action == 'ask') {
				Taro.navigateTo({
					url: '/v2/pages/ask/askChannel'
				})
			} else if (action == 'group') {
				Taro.navigateTo({
					url: '/v2/pages/group/groupChannel'
				})
			} else {
				Taro.navigateTo({
					url: '/v2/pages/user/' + action
				})
			}
		}
	}

	onScan = () => {
		const {actions} = this.props;

		Taro.scanCode({
			success: (res) => {
				const b64str = res.result

				try {
					const barr = Taro.base64ToArrayBuffer(b64str)
					const obj = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(barr)))
					console.info(obj)

					if (obj.squad_id) {
						actions.o2o.sign({
							squad_id: obj.squad_id,
							resolved: (data) => {
								Taro.showToast({
									title: '???????????????',
									icon: 'success'
								})
							},
							rejected: (msg) => {
								Taro.showToast({
									title: msg,
									icon: 'none'
								})
							}
						})
					}

				} catch (e) {
					Taro.showToast({
						title: '???????????????????????????????????????',
						icon: 'none'
					})
				}
			}
		})
	}

	onLogout = () => {
		const {actions} = this.props;

		Taro.showModal({
			title: '?????????',
			content: '??????????????????????',
			success: function (res) {
				if (res.confirm) {
					actions.passport.logout({
                        resolved: (data) => {
                            actions.user.user();
                        },
                        rejected: (msg) => {
            
                        }
                    });
				}
			}
		})
	}

	render () {
		const {user} = this.props;
        const {refresh, teacher, unread, utype} = this.state;
		
		let avatar = asset.base.avatar;
		if (user.userId && user.avatar != '') {
            avatar = user.avatar;
        }

		return (
			<View className='user container row col bg_light'>
				<ScrollView
					scrollY
					className={'h_full'}

					refresherEnabled={true}
					refresherTriggered={refresh}

					onRefresherRefresh={(e) => {
						this.onHeaderRefresh()
					}}
				>
					<View className={'bg p_30'}>
						<View className={'row ai_ct jc_end'}>
							<View className={'mr_20'} onClick={() => this.onAction('message/message')}>
								<IconFont name={'xiaoxi'} color={'white'} size={48}/>
							</View>
							<View onClick={() => this.onAction('scan')}>
								<IconFont name={'scan'} color={'white'} size={48}/>
							</View>
						</View>
						<View className={'row ai_ct'} onClick={() => this.onAction('account')}>
							<Image src={avatar} className={'avatar bg_light'} mode={'aspectFill'}/>
							{user.userId ?
							<View className={'row ai_ct'}>
								<Text className={'label_white ml_10'}>{user.nickname}</Text>
								<View className={'ml_10'}>
									<IconFont name={'account'} color={'white'} size={24}/>
								</View>
							</View>
							:
							<Text className={'label_white ml_10'}>????????????</Text>}
						</View>

						<View className={'row ai_ct mt_30'}>
							<View className={'col_1 row col ai_ct'} onClick={() => this.onAction('collect')}>
								<Text className={'label_white label_20'}>{user.collectNum | 0}</Text>
								<Text className={'row label_white mt_10'}>??????</Text>
							</View>
							<View className={'col_1 row col ai_ct'} onClick={() => this.onAction('follow')}>
								<Text className={'label_white label_20'}>{user.follow | 0}</Text>
								<Text className={'row label_white mt_10'}>??????</Text>
							</View>
							<View className={'col_1 row col ai_ct'} onClick={() => this.onAction('integral')}>
								<Text className={'label_white label_20'}>{user.integral | 0}</Text>
								<Text className={'row label_white mt_10'}>??????</Text>
							</View>
							{utype == 1 ?
							<View className={'col_1 row col ai_ct'} onClick={() => this.onAction('integral')}>
								<Text className={'label_white label_20'}>{user.credit | 0}</Text>
								<Text className={'row label_white mt_10'}>??????</Text>
							</View>
							: null}
							<View className={'col_1 row col ai_ct'} onClick={() => this.onAction('course')}>
								<Text className={'label_white label_20'}>{user.courseNum | 0}</Text>
								<Text className={'row label_white mt_10'}>??????</Text>
							</View>
						</View>
					</View>

					{utype == 0 ?
					<View className={'menu row wrap bg_white'}>
						<View className={'item row col ai_ct pt_30'} onClick={() => this.onAction('integral')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.account.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30'} onClick={() => this.onAction('exam/test')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.test.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30'} onClick={() => this.onAction('cert')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.cert.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30'} onClick={() => this.onAction('medal/medal')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.medal.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30 pb_30'} onClick={() => this.onAction('group')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.group.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30 pb_30'} onClick={() => this.onAction('lucky/lucky')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.lucky.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30 pb_30'} onClick={() => this.onAction('feedback')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.teacher.medal.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30 pb_30'} onClick={() => this.onAction('grow/grow')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.grow.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
					</View>
					:
					<View className={'menu row wrap bg_white'}>
						<View className={'item row col ai_ct pt_30'} onClick={() => this.onAction('integral')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.account.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30'} onClick={() => this.onAction('exam/test')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.test.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30 pb_30'} onClick={() => this.onAction('lucky/lucky')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.lucky.png'} className={'icon'}/>
							<Text className={'row mt_10'}>????????????</Text>
						</View>
						<View className={'item row col ai_ct pt_30 pb_30'} onClick={() => this.onAction('ask')}>
							<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/nav.teacher.medal.png'} className={'icon'}/>
							<Text className={'row mt_10'}>?????????</Text>
						</View>
					</View>
					}
					
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light mt_30'} onClick={() => this.onAction('task')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					{utype == 1 ?
					(teacher ?
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('teacher/medal')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					:<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction(utype == 0 ? 'teacher/apply': 'teacher/corp')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>) : null}
					{utype == 0 ?
					(teacher ?
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('teacher/medal?type=1')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>:
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction(utype == 0 ? 'teacher/apply': 'teacher/corp')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>):null}
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('squad')}>
						<Text>?????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('qr')}>
						<Text>?????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('about/about')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('address/address')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					{utype == 1 ?
					<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => this.onAction('feedback')}>
						<Text>????????????</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
					: null}

					{user.userId ?
					<View className={'row ai_ct p_10'} onClick={this.onLogout}>
						<Button className={'col_1'} size={'mini'}>????????????</Button>
					</View>
					: null}
				</ScrollView>
				
			</View>
		)
	}
}

const LayoutComponent = User;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        unread: state.user.unread,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})