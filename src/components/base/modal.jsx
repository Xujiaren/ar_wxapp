import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'

import './base.less'

export default class Modal extends Component {

	state = {
		visible: this.props.visible || false,
	}

	componentWillReceiveProps(nextProps) {
		const {visible} = nextProps;

		if (visible !== this.state.visible) {
			this.setState({
				visible: visible,
			})
		}
	}

	render () {
		const {visible} = this.state;
		if (!visible) return null;

		return (
			<View className={'modalContainer'}>
                {this.props.children}
			</View>
		)
	}
}
