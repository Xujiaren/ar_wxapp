import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import '@tarojs/taro/html.css'

const title = ['关于我们', '隐私条款', '版权声明', '联系我们', '商业使用', '证照信息', '用户服务使用协议'];
const types = ['aboutus', 'privacy', 'copyright', 'contact', 'business', 'pinfo', 'policy'];

class Content extends Component {

	state = {
		html: '',
	}

	type = getCurrentInstance().router.params.type || 0;

	componentDidMount() {
		const {actions} = this.props;
		actions.news.about({
            type: types[this.type],
            resolved: (data) => {
                this.setState({
                    html: data,
                })
            },
            rejected: (msg) => {
                
            }
        });
	}

	render () {
		const {html} = this.state;

		return (
			<View className={'about container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40'}>
                            <View className={'taro_html'} dangerouslySetInnerHTML={{__html: html}}></View>
                        </View>
                    </ScrollView>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Content;

function mapStateToProps(state) {
	return {
		
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})