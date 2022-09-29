import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Picker, Input, Textarea, Button, Text } from '@tarojs/components'
import IconFont from '../../../../components/iconfont'
import connectComponent from '../../../../util/connect'
import asset from '../../../../config/asset'
import './teacher.less'

const sexs = ['保密', '男', '女'];
const mstatus = ['等待审核', '拒绝申请', '申请通过'];

class Corp extends Component {

    state = {
        loaded: false,
        applyed: false,
        status: 0,

        sex: 0,
        company_name: '', 
        system_name: '', 
        job: '', 
        name: '', 
        birthday: '1980-01-01', 
        school: '', 
        edu: '', 
        specialty: '', 
        work_years: '', 
        this_work_years: '',  
        show_value: '',
        train_exp: '', 
        strong: '',

        gallery: [],

    }

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {apply_info} = nextProps;

        if (apply_info !== this.props.apply_info) {
            let applyed = false;
            let status = 0;
            let gallery = [];

            if (apply_info.applyId) {
                applyed = true;
                status = apply_info.status;

                apply_info.galleryList.map((pic, index) => {
                    gallery.push(pic.fpath);
                });
            }

            this.setState({
                loaded: true,
                applyed: applyed,
                gallery: gallery,
                status: status,
            })
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.teacher.applyInfo();
    }

    onUpload = () => {
        const {actions} = this.props;
        const {gallery} = this.state;

        Taro.chooseImage({
			count: 1,
			sizeType: ["original", "compressed"],
			sourceType: ['album', 'camera'],
			success: (res) => {
				if (res.errMsg === 'chooseImage:ok') {
					const tf = res.tempFilePaths[0];
					Taro.getFileSystemManager().readFile({
                        filePath: tf,
                        encoding: 'base64',
                        success: (e) => {
                            actions.site.upload({
                                file:'data:image/jpeg;base64,' + e.data,
                                resolved: (data) => {
                                    gallery.unshift(data);

                                    this.setState({
                                        gallery: gallery,
                                    })
                                },
                                rejected: (msg) => {
                                    Taro.showToast({
                                        title: '上传失败',
                                        icon: 'none',
                                    })
                                },
                            });
                        }
                    })
				}
			}
		})
    }

    onRemove = (index) => {
        const {gallery} = this.state;
        gallery.splice(index, 1);

        this.setState({
            gallery: gallery,
        })
    }

    onApply = () => {
        const {actions} = this.props;
        const {company_name, system_name, job, name, sex, birthday, school, edu, specialty, work_years, this_work_years, gallery, show_value, train_exp, strong} = this.state;

        if (company_name.length == 0) {
            Taro.showToast({
                title: '请先填写所在公司。',
                icon: 'none'
            })
            return;
        }

        if (system_name.length == 0) {
            Taro.showToast({
                title: '请先填写所在部门。',
                icon: 'none'
            })
            return;
        }

        if (name.length == 0) {
            Taro.showToast({
                title: '请先填写姓名。',
                icon: 'none'
            })
            return;
        }

        actions.teacher.corpApply({
            company_name: company_name,
            system_name: system_name,
            job: job,
            name: name,
            sex: sex,
            birthday: birthday,
            school: school,
            edu: edu,
            specialty: specialty,
            work_years: work_years,
            this_work_years: this_work_years,
            train_cert: gallery.join(','),
            show_value: show_value,
            train_exp: train_exp,
            strong: strong,

            resolved: (data) => {
                this.setState({
                    applyed: true,
                })

                Taro.showToast({
                    title: '申请成功',
                    icon: 'success'
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '申请失败',
                    icon: 'none'
                })
            }
        })
    }
    

	render () {
        const {loaded, applyed, status, company_name, system_name, job, name, birthday, school, edu, specialty, work_years, this_work_years, show_value, train_exp, strong, sex, gallery, preview, preview_imgs, preview_index} = this.state;

        const enable = !applyed;

        if (!loaded) return null;

		return (
			<View className={'teacher container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>所在公司</Text>
                            <Input placeholder={'请填写所在公司'} className={'label_end'} value={company_name} onInput={(e) => {
                                this.setState({
                                    company_name: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>所在部门</Text>
                            <Input placeholder={'请填写所在部门'} className={'label_end'} value={system_name} onInput={(e) => {
                                this.setState({
                                    system_name: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>岗位</Text>
                            <Input placeholder={'请填写岗位'} className={'label_end'} value={job} onInput={(e) => {
                                this.setState({
                                    job: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>姓名</Text>
                            <Input placeholder={'请填写姓名'} className={'label_end'} value={name} onInput={(e) => {
                                this.setState({
                                    name: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>性别</Text>
                            <Picker mode='selector' range={sexs} value={sex} onChange={(e) => {
                                this.setState({
                                    sex: e.detail.value
                                })
                            }}>
                                <Text className={'label_gray label_12'}>{sexs[sex]}</Text>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>生日</Text>
                            <Picker mode='date' value={birthday} onChange={(e) => {
                                this.setState({
                                    birthday: e.detail.value
                                })
                            }}>
                                <Text className={'label_gray label_12'}>{birthday || '选择生日'}</Text>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>毕业院校</Text>
                            <Input placeholder={'请填写毕业院校'} className={'label_end'} value={school} onInput={(e) => {
                                this.setState({
                                    school: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>学历</Text>
                            <Input placeholder={'请填写学历'} className={'label_end'} value={edu} onInput={(e) => {
                                this.setState({
                                    edu: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>专业</Text>
                            <Input placeholder={'请填写专业'} className={'label_end'} value={specialty} onInput={(e) => {
                                this.setState({
                                    specialty: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>工作年限</Text>
                            <Input placeholder={'请填写工作年限'} className={'label_end'} value={work_years} onInput={(e) => {
                                this.setState({
                                    work_years: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>本公司工作年限</Text>
                            <Input placeholder={'请填写本公司工作年限'} className={'label_end'} value={this_work_years} onInput={(e) => {
                                this.setState({
                                    this_work_years: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'bg_white p_30 border_bottom'}>
                            <Text>资源主题</Text>
                            <Textarea className={'bg_light content circle_5 p_20 mt_10'} placeholder={'50字以内'} value={show_value} onInput={(e) => {
                                this.setState({
                                    show_value: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'bg_white p_30 border_bottom'}>
                            <Text>工作经历</Text>
                            <Textarea className={'bg_light content circle_5 p_20 mt_10'} placeholder={'50字以内'} value={train_exp} onInput={(e) => {
                                this.setState({
                                    train_exp: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'bg_white p_30 border_bottom'}>
                            <Text>自我评价</Text>
                            <Textarea className={'bg_light content circle_5 p_20 mt_10'} placeholder={'50字以内'} value={strong} onInput={(e) => {
                                this.setState({
                                    strong: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white'}>
                            <Text>活动封面</Text>
                        </View>
                        <View className={'p_30 row wrap bg_white'}>
                            {gallery.map((g, index) => {
                                return (
                                    <View className={'mr_10 mb_10 upload_ctrl'}>
                                        <Image src={g} className={'supload'} onClick={() => {
                                            Taro.previewImage({
                                                urls: gallery,
                                                current: g
                                            })
                                        }}/>
                                        <View className={'remove'} onClick={() => this.onRemove(index)}>
                                            <IconFont name={'guanbi1'} color={'red'}/>
                                        </View>
                                    </View>
                                )
                            })}
                            <Image src={asset.base.upload} className={'supload'} onClick={this.onUpload}/>
                        </View>
                    </ScrollView>
                </View>
                <View className={'p_10 row'}>
                    <Button className={'col_1 bg_blue label_white'} disabled={!enable} onClick={this.onApply}>{applyed ? mstatus[status] : '提交'}</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Corp;

function mapStateToProps(state) {
	return {
		apply_info: state.teacher.apply_info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
