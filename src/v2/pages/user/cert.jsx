import React, { Component } from 'react'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './user.less'

class Cert extends Component {

	state = {
		refresh: false,
	}
	
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {cert} = nextProps;

        if (cert !== this.props.cert) {
            this.items = cert;

            this.setState({
                refresh: false,
            })
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.cert();

		this.setState({
			refresh: true,
		})
    }

	render () {
		const {refresh} = this.state;

		return (
			<View className={'cert container row col bg_light'}>
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
                            {this.items.map((cert, index) => {
								return (
                                    <View className={'item mb_30 row col ai_ct'}>
                                        <Image src={cert.certImg} className={'thumb bg_light'}/>
                                        <Text className={'row mt_10'}>{cert.certName}</Text>
                                        <Text className={'row mt_5'}>{cert.contentName}</Text>
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

const LayoutComponent = Cert;

function mapStateToProps(state) {
	return {
		cert: state.user.cert,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})