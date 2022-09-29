import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, WebView, CoverView, Image, Button, Input, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import config from '../../../../config/param'
import './lucky.less'


class Lucky extends Component {

	state = {
		loaded: false,
		sync: false,

		reward: false,
		reward_id: 0,

		integral:0,

		name: '',
		mobile: '',
		address: '',
	}

	reward = {ctype: 1}
	from = getCurrentInstance().router.params.from || 0
	
	componentDidMount() {
		this.onHeaderRefresh();
	}
	
	componentWillReceiveProps(nextProps) {
        const {user, address, flop} = nextProps;
		const {loaded} = this.state;

		if (user !== this.props.user) {
			this.setState({
				integral: user.integral,
			})
		}

        if (flop !== this.props.flop) {
            this.activity = flop.activity;

			if (!loaded) {
				
				if (this.from == 0) {
					if (!(user.lottery > 0 ||  user.integral >= this.activity.integral)){
						Taro.showModal({
							title: '翻牌抽奖',
							content: '积分不足',
							showCancel: false,
							success: function (res) {
								Taro.navigateBack()
							}
						})
					} else {

						const that = this
						Taro.showModal({
							title: '翻牌抽奖',
							content: this.activity.integral + '积分兑换一次抽奖',
							success: function (res) {
								if (res.cancel) {
									Taro.navigateBack()
								}
							}
						})
					}
				}

				this.setState({
					loaded: true,
				})
			}
        }

        if (address !== this.props.address) {
            if (address.length > 0) {
                let _address = address[0];

                for (let i = 0; i < address.length; i++) {
                    const aitem = address[i];

                    if (aitem.isFirst == 1) {
                        _address = aitem;
                    }
                }

                this.setState({
                    name: _address.realname,
                    mobile: _address.mobile,
                    address: _address.address,
                })
            }
        }
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
        actions.user.user();
        actions.user.address();
        actions.activity.flop(1);
    }

	onSync = () => {
		const {actions} = this.props;
		const {sync} = this.state;

		if (!sync) {
			this.reward = Taro.getStorageSync('reward') || {}

			if (this.reward.index) {
				actions.activity.lottery({
				    activity_id: 1,
				    ts: new Date().getTime(),
				    index: this.reward.index,
				    resolved: (data) => {
						actions.user.user();
						if (this.reward.ctype == 2) {
							this.setState({
								reward: true,
								sync: true,
								reward_id: data.rewardId,
							})
						} else {
							this.setState({
								reward_id: data.rewardId,
							}, () => {
								this.onReward()
							})
						}
				    },
				    rejected: (msg) => {
						
				    },
				})
			}
		}
		
	}

	handleMessage = (e) => {
		Taro.setStorageSync('reward', e.detail.data[0])
    }

	onReward = () => {
		const {actions} = this.props;
        const {reward_id, name, mobile, address} = this.state;

		actions.user.user();

        if (this.reward.ctype == 0) {
            Taro.removeStorageSync('reward');

			this.setState({
				reward: false,
			})
        } else {
            actions.activity.lotteryReceive({
                reward_id: reward_id,
                name: name,
                mobile: mobile,
                address: address,
                resolved: (data) => {
                    Taro.removeStorageSync('reward');

					Taro.showToast({
						title: '领取成功',
						icon: 'success',
						duration: 2000,
						success: () => {
							this.setState({
								reward: false,
							})
						}
					})
                },
                rejected: (msg) => {
                    this.setState({
                        reward: false
                    }, ()=>{
                        setTimeout(()=>{
                            this.refs.hud.show('领取失败，联系客服', 1);
                            this.refs.WebView.reload();
                            this.onRefresh();
                        },1000)

						Taro.showToast({
							title: '领取失败，联系客服',
							icon: 'none',
						})
                        
                    })
                },
            })
        }
	}

	render () {
		const {user} = this.props;
		const {loaded, integral, reward, name, mobile, address} = this.state;
		if (!loaded) return null;
		const times = parseInt(integral / this.activity.integral);

		let enable = true;
        if (this.reward.ctype && this.reward.ctype == 2) {
            enable = name.length > 0 && mobile.length == 11 && address.length > 0;
        }

		return (
			<View className={'lucky container row col bg_light'}>
				{reward ?
				<View className={'modal'}>
					<View className={'reward bg_white circle_5 p_10'}>
						{this.reward.ctype == 2 ?
						<View>
							<View className={'row col ai_ct'}>
								<Text className={'label_20'}>恭喜您</Text>
								<Text className={'row label_16 label_gray mt_5'}>获得{this.reward.name}</Text>
								<Image src={this.reward.img} className={'reward_empty mt_15'}/>
							</View>
							<Text className={'row label_16 mt_15'}>填写地址</Text>
							<Input placeholder={'姓名'} className={'mt_15 bg_light p_10 circle_5'} value={name} onInput={(e) => {
								this.setState({
									name: e.detail.value
								})
							}}/>
							<Input placeholder={'手机'} className={'mt_15 bg_light p_10 circle_5'} value={mobile} onInput={(e) => {
								this.setState({
									mobile: e.detail.value
								})
							}}/>
							<Input placeholder={'地址'} className={'mt_15 bg_light p_10 circle_5'} value={address} onInput={(e) => {
								this.setState({
									address: e.detail.value
								})
							}}/>
						</View>
						: null}
						<Button className={'mt_10 bg_blue label_white'} disabled={!enable} onClick={this.onReward}>{this.reward.ctype == 2 ? '领取' : '确定'}</Button>
					</View>
				</View>
				: <WebView src={config.site + 'reward/index.html?v=76&integral=' + integral + '&times=' + times + '&ts=' + (new Date().getTime())} onMessage={this.handleMessage} onLoad={this.onSync}/>}
			</View>
		)
	}
}

const LayoutComponent = Lucky;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        address: state.user.address,
        flop: state.activity.flop,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})