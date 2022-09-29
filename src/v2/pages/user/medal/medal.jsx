import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { View, ScrollView, Progress, Image, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import './medal.less'

class Medal extends Component {

	state = {
		refresh: false,
	}

    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {medal} = nextProps;

        if (medal !== this.props.medal) {
            this.items = medal;

            this.setState({
                refresh: false,
            })
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.medal();

		this.setState({
			refresh: true,
		})
    }

	render () {
		const {refresh} = this.state;

		return (
			<View className={'medal container row col bg_light'}>
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
						<View className={'p_40 row wrap'}>
                            {this.items.map((medal, index) => {
								return (
                                    <View className={'item mb_30 mt_30 row col'} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/user/medal/info?current=' + index
										})
									}}>
                                        <Image src={medal.img} className={classNames('thumb bg_light as_ct', {'thumb_disable': !medal.have})}/>
                                        <Text className={'row mt_10 as_ct'}>{medal.title}Lv.{medal.lv}</Text>
                                        <Progress className={'col_1 mt_5'} percent={parseFloat(medal.nowNum / medal.allNum) * 100} strokeWidth={4} activeColor={'#00A6F6'} borderRadius={5}/>
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

const LayoutComponent = Medal;

function mapStateToProps(state) {
	return {
        medal: state.user.medal,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})