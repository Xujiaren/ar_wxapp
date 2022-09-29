import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import SquadCell from '../../../components/discovery/squad'

import './user.less'

class Squad extends Component {

    state = {
		refresh: false,
    }

    page = 0
	pages = 1
	total = 0
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {squad} = nextProps;

        if (squad !== this.props.squad) {
            this.pages = squad.pages;
            this.total = squad.total;
            this.items = this.items.concat(squad.items);
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

        actions.user.squad(3, 0);

		this.setState({
			refresh: true,
		})
    }

	onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < (this.pages - 1)) {
            this.page++;
			actions.user.squad(3, this.page);
		}
	}

	render () {
		const {refresh} = this.state;

		return (
			<View className={'squad container row col'}>
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
						<View className={'p_40'}>
                            {this.items.map((squad, index) => {
								return <SquadCell className={'mb_30'} squad={squad} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/discovery/squad?squadId=' + squad.squadId,
									})
								}}/>
							})}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Squad;

function mapStateToProps(state) {
	return {
		squad: state.user.squad,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})