import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'

import './user.less'

class Task extends Component {

	state = {
		refresh: false,
	}

    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {task} = nextProps;

        if (task !== this.props.task) {
            this.items = task;

            this.setState({
                refresh: false,
            })
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
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
		const {refresh} = this.state

		return (
			<View className={'task container row col'}>
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
                            {this.items.map((task, index) => {
								const done = task.status == 1;

								return (
                                    <View className={'row ai_ct jc_sb p_10 mb_30'}>
                                        <View>
                                            <Text>{task.taskName} <Text className={'label_12 label_blue'}>+{task.integral}</Text></Text>
                                            <Text className={'row label_12 label_light mt_5'}>{task.taskSummary}</Text>
                                        </View>
                                        <Button className={classNames('label_white circle_25 mr_0', {'bg_lgray': done, 'bg_blue': !done})} disabled={done} size={'mini'} onClick={() => {
											this.onTask(task.link)
										}}>{done ? '已完成' : '去完成'}</Button>
                                    </View>
                                )
							})}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Task;

function mapStateToProps(state) {
	return {
		task: state.user.task,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})