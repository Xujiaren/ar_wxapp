import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'

import './study.less'

class Map extends Component {

	state = {
		refresh: false,
	}

	mapId = getCurrentInstance().router.params.mapId || 0
	maps = []
	
	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {map_info} = nextProps;

        if (map_info !== this.props.map_info) {
            this.maps = map_info;
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
        actions.course.mapInfo(this.mapId);

		this.setState({
			refresh: true,
		})
	}

	onJump = (level) => {
		const {actions} = this.props;
        
        actions.course.levelStatus({
            level_id: level.levelId,
            resolved: (data) => {
                if (level.contentSort == 1) {
					Taro.navigateTo({
						url: '/v2/pages/course/vod?courseId=' + level.courseId + '&levelId=' + level.levelId
					})
		
				} else {
					Taro.navigateTo({
						url: '/v2/pages/study/paper?paperId=' + level.paperId + '&levelId=' + level.levelId
					})
				}
            },
            rejected: (res) => {
                
            },
        })
	} 

	render () {
		const {refresh} = this.state;

		return (
			<View className={'map container row col'}>
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
                            {this.maps.map((card, index) => {

								const lock = card.lockStatus == 1;
								const pass = card.finishStatus == 1 || card.lockStatus == 0;

                                return (
                                    <View className={classNames('level ml_10 mr_10 mb_40 row col ai_ct jc_ct ', {'pass': pass, 'lock': !pass})} onClick={() => {
										if (!lock) {
											this.onJump(card)
										}
									}}>
										{pass ?
                                        <Text className={'label_white label_25'}>{index + 1}</Text>
										: null}
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

const LayoutComponent = Map;

function mapStateToProps(state) {
	return {
		map_info: state.course.map_info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})