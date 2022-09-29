import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { QRCode } from 'taro-code'
import connectComponent from '../../../util/connect'
import config from '../../../config/param'
import './user.less'

class Qr extends Component {

	state = {
		loaded: false,
	}

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {user} = nextProps;

        if (user !== this.props.user) {
            this.setState({
				loaded: true,
			})
        }

		
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
    }

	render () {
		const {user} = this.props;
		const {loaded} = this.state;
		if (!loaded) return null;

		return (
			<View className={'user container row col bg_light'}>
				<View className={'p_40 row col ai_ct mt_30'}>
                    <QRCode
                        text={config.site + '#/userCheck/' + user.userId}
                        size={160}
                        scale={4}
                    />
                </View>
			</View>
		)
	}
}

const LayoutComponent = Qr;

function mapStateToProps(state) {
	return {
		user: state.user.user,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})