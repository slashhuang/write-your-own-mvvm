/**
 * Created by slashhuang on 16/10/26.
 */
import $ from 'jquery';
const reg =/@(.*)/i; //事件正则
const musReg = /{{(.*)}}/i; //模板绑定
class MVVM {
    constructor(config,target){
        this.target = target;
        this.config =config;
        this.virtualDom={};
        //主逻辑入口
        this.logic()
    }
    logic(){
        this.defineGetterSetter();
        this.parser();//解析模板,生成虚拟dom
        this.addEvent(this.virtualDom); //挂载事件
        this.render();//渲染到dom节点
    }
    defineGetterSetter(){
        let {data} = this.config;
        let $data = data();
        //定义简化版的getter setter
        let self =this;
        for(let key in $data){ //get set仍旧挂载在this.config上面
            Object.defineProperty(this.config, key, {
                set: function(newVal) {
                    self.digest(key,newVal);
                    return newVal
                }
            });
        }
    }
    //更新dom
    digest(key,val){
        this.virtualDom.data[key] = val;
        this.render();
    }
    parser() {
        let { template,data} =this.config;
        //初始化的数据
        let $data =data();
        //存储dom节点对应的指令
        let cmdList=[];
        //生成dom节点 createDocumentFragment
        let fragment = $(template);
        //解析dom节点的属性
        let $attributes = [].slice.call(fragment[0].attributes);
        $attributes && $attributes.forEach((attr)=>{
            //存储指令列表
            cmdList.push({
                event:reg.exec(attr.name)[1],
                callbackName:attr.value
            });
        });
        //解析dom节点的innerHTML对应的key值
        let keyName=musReg.exec(fragment.html())[1];
        //生成虚拟dom结构
        let fragVdom= {
            fragment:fragment, //dom
            cmdList:cmdList,  //指令
            data:$data,//数据
            watcherKey:keyName,//依赖的键值数组
            renderFunc:function(){ //渲染方式
                return this.fragment.html(this.data[this.watcherKey]);
            },
            children:[]
        };
        //这里只是个简单演示,并未做遍历dom结构处理
        this.virtualDom = fragVdom;
    }
    addEvent(vDom){
        let {fragment,cmdList} = vDom;
        cmdList && cmdList.forEach((cmd)=>{
            let {
                event,callbackName
            } = cmd;
            fragment.on(event,this.getMethod(callbackName))
        });
    }
    getMethod(name){
        let { methods }= this.config;
        return ()=>methods[name].apply(this.config); //保证引用中的this指向config文件
    }
    render() {
        this.target.empty().append(this.virtualDom.renderFunc());
    }
};
let config = {
    template : '<div @click="changeTest">{{test}}</div>',
    data(){
        return {
            test:'您初始化了所有的dom节点'
        }
    },
    methods:{
        changeTest:function(e){
            this.test = '点击了'
        }
    }
};
setTimeout(()=>new MVVM(config,$('#app')),0);
