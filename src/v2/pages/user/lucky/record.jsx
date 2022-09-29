import React, { Component } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'

class Record extends Component {

    state = {
        refresh: false,
    }

    page = 0;
    pages = 1
    total = 0
    items = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {reward} = nextProps;

        if (reward !== this.props.reward) {
            this.page = reward.page;
            this.pages = reward.pages;
            this.total = reward.total;
            this.items = this.items.concat(reward.items);
        }

        this.setState({
			refresh: false,
		})
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.activity.reward(0);

		this.setState({
			refresh: true,
		})
    }

    onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < (this.pages - 1)) {
            this.page++;
			actions.activity.reward(this.page);
		}
	}

	render () {
        const {refresh} = this.state;

		return (
			<View className={'lucky container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
                        refresherEnabled={true}
						refresherTriggered={refresh}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}
					>
                        {this.items.map((reward, index) => {
                            return (
                                <View className={'p_15 pl_20 pr_20 bg_white bottom_light'}>
                                    <Text>获得 {reward.itemName}</Text>
                                    <Text className={'label_gray label_12 row mt_5'}>{reward.pubTimeFt}</Text>
                                </View>
                            )
                        })}
                    </ScrollView>
                </View>
			</View>
		)
	}
}


const LayoutComponent = Record;

function mapStateToProps(state) {
	return {
        reward: state.activity.reward,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})