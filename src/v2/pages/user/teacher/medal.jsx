import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import './teacher.less'

class Medal extends Component {

	state = {
		refresh: false,
	}
	type = getCurrentInstance().router.params.type || 0
    items = []
	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {cert,user} = nextProps;

        if (cert !== this.props.cert) {
            this.items = cert;

            this.setState({
                refresh: false,
            })
        }
		if(user!==this.props.user){
			this.items=user.teacherDTO.certDTOS;
			this.setState({
                refresh: false,
            })
		}
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
		if(this.type==0){
			actions.teacher.cert();
		}else{
			actions.user.user();
		}
		this.setState({
			refresh: true,
		})
	}

	render () {
		const {refresh} = this.state

		return (
			<View className={'teacher container row col bg_light'}>
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
                                    <View className={'item mb_30 mt_30 row col'}>
                                        <Image src={cert.certImg} className={'thumb as_ct'}/>
                                        <Text className={'row mt_10 as_ct'}>{cert.certName}</Text>
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
		cert: state.teacher.cert,
		user: state.user.user,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})