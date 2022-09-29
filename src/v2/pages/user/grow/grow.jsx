import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Progress, Image, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../../../../components/iconfont'
import connectComponent from '../../../../util/connect'
import './grow.less'

class Grow extends Component {

	state = {
		loaded: true,
		refresh: false,
	}

	equity = []
	lmap = {}
	level = []
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {user, level, task} = nextProps;

        if (user !== this.props.user) {
            this.equity = user.equityList;
        }

        if (level !== this.props.level) {
            this.level = level;

            this.level.map((level, index) => {
                this.lmap[level.levelId] = level;
            })

			this.setState({
				loaded: true,
			})
        }

        if (task !== this.props.task) {
            this.items = task;
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
        actions.user.level();
        actions.user.task();

		this.setState({
			refresh: true,
		})
    }

	onTask = (link) => {
		if (link.indexOf('/user/userInfo') > -1) {
			Taro.navigateTo({
				url: '/v2/pages/user/account'
			})
		}  else if (link.indexOf('/index/search') > -1){
            Taro.switchTab({
				url: '/pages/home/index'
			})
        } else {
			Taro.switchTab({
				url: '/pages/home/index'
			})
		}
	}

	render () {
		const {user} = this.props
		const {refresh, loaded} = this.state

		if (!loaded) return null;

		let progress = 100;

        if (this.lmap[user.level]) {
            const level = this.lmap[user.level];
            const un = parseInt(user.prestige) - parseInt(level.beginPrestige);
            const tn = parseInt(level.endPrestige) - parseInt(level.beginPrestige);

            progress = parseFloat(un / tn) * 100;
        }

		return (
			<View className={'grow container row col'}>
                <View className={'top'}/>
				
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}

						refresherEnabled={true}
						refresherTriggered={refresh}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}
					>
						<View className={'p_40'}>
							<View className={'pl_20 pr_20'}>
								<View className={'row ai_ct jc_sb'}>
									<View className={'row col ai_ct'}>
										<Text className={'label_25 label_gold'}>{user.integral || 0}</Text>
										<Text className={'label_white'}>积分</Text>
									</View>
									<Image src={user.avatar} className={'avatar border_white bg_light'}/>
									<View className={'row col ai_ct'}>
										<Text className={'label_25 label_gold'}>{user.prestige || 0}</Text>
										<Text className={'label_white'}>成长值</Text>
									</View>
								</View>
								<View className={'step row mt_30'}>
									<View className={'line shadow_bottom'}/>
									{this.level.map((item, index) => {
										const on = user.level >= item.levelId;

										return (
											<View className={'col_1'}>
												<View className={classNames({'ldot': !on, 'ydot': on})}/>
												<Text className={classNames('label_9', {'label_light': !on, 'label_gold': on})}>Lv.{index + 1}</Text>
											</View>
										)
									})}
								</View>
								<View className={'level level_1 mt_30 p_40'}>
									<Text className={'label_16 label_bold row mt_10'}>Lv.{user.level}</Text>
									<Text className={'label_12'}>当前成长值 {user.prestige} 点</Text>
									<View className={'mt_5 progress'}>
										<Progress percent={progress} strokeWidth={4} activeColor={'#333333'} borderRadius={5}/>
										<View className={'row ai_ct jc_sb mt_5'}>
											<Text className={'label_9'}>Lv.{user.level}</Text>
											<Text className={'label_9'}>Lv.{this.lmap[user.level + 1] ? user.level + 1 : user.level}</Text>
										</View>
									</View>
								</View>
							</View>

							<View className={'mt_30 p_40 bg_white circle_10 shadow_bottom'}>
								<View className={'row ai_ct jc_sb'}>
									<Text>Lv.{user.level}特权</Text>
									<View className={'row ai_ct'} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/user/grow/right'
										})
									}}>
										<Text className={'label_light mr_5'}>权益详情</Text>
										<IconFont name={'right'} color={'#999999'}/>
									</View>
								</View>
								<View className={'mt_30 row'}>
								{this.equity.map((eitem, index) => {
									return (
									<View className={'col_1 row col ai_ct'}>
										<Image src={eitem.equityImg} className={'eicon'}/>
										<Text className={'row mt_10'}>{eitem.equityName}</Text>
									</View>
									)
								})}
									
								</View>
							</View>

							<View className={'mt_30 p_40 bg_white circle_10 shadow_bottom task'}>
								<Text className={'label_16'}>会员任务</Text>
								{this.items.map((item, index) => {
									const done = item.status == 1;

									return (
										<View className={'row ai_ct jc_sb p_10 mt_30'}>
											<View className={'info'}>
												<View className={'row ai_ct'}>
													<Text>{item.taskName}</Text>
													<Text className={'label_9 label_gold row ml_5'}>+{item.integral}</Text>
												</View>
												<Text className={'row label_12 label_light mt_5'}>{item.taskSummary}</Text>
											</View>
											<Button className={classNames('label_white circle_25 mr_0', {'bg_lgray': done, 'bg_blue': !done})} size={'mini'} disabled={done} onClick={() => this.onTask(item.link)}>{done ? '已完成' : '去完成'}</Button>
										</View>
									)
								})}
							</View>
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Grow;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        level: state.user.level,
        task: state.user.task,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})