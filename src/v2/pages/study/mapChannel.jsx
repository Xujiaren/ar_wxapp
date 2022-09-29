import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './study.less'

class MapChannel extends Component {

	state = {
		refresh: false,
	}

	page = 0
	pages = 1
	total = 0
	maps = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {map} = nextProps;

        if (map !== this.props.map) {
            this.maps = this.maps.concat(map.items);
            this.total = map.total;
            this.pages = map.pages;
        }

        this.setState({
			refresh: false
		})
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.maps = [];

        actions.course.map(0);

		this.setState({
			refresh: true
		})
	}

	onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.course.map(this.page);
        }
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

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}
					>
						<View className={'p_40'}>
                            {this.maps.map((map, index) => {
                                return (
                                    <View className={'item mb_30 '} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/study/map?mapId=' + map.mapId
										})
									}}>
                                        <Image src={map.mapImg} className={'thumb bg_light circle_10'}/>
                                        <View className={'row ai_ct jc_sb pt_10 pb_10 bottom_light'}>
                                            <Text>{map.mapName}</Text>
                                            <Text className={'label_12 label_gray'}>{map.finish ? '已完成' : '未完成'}</Text>
                                        </View>
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

const LayoutComponent = MapChannel;

function mapStateToProps(state) {
	return {
		map: state.course.map,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})