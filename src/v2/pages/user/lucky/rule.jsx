import React, { Component } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'

import connectComponent from '../../../../util/connect'

class Rule extends Component {

	state = {
		loaded: false,
	}

	activity = {}

	componentDidMount() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {flop} = nextProps;

        if (flop !== this.props.flop) {
            this.activity = flop.activity;

            this.setState({
                loaded: true,
            })
        }
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
        actions.activity.flop(1);
    }

	render () {
		const {loaded} = this.state
		if (!loaded) return null

		return (
			<View className={'lucky container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40'}>
                            <Text>{this.activity.rule}</Text>
                        </View>
                    </ScrollView>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Rule;

function mapStateToProps(state) {
	return {
        flop: state.activity.flop,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})