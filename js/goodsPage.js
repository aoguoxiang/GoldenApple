/* 只有后勤部领导才有权限添加物资
*  所有登陆用户都可以申领物资
*  确认申领后会同步反映到“申领信息”的表格中，包括申领物资的编号，名称，数量，申领人姓名，联系方式，备注信息
 */
layui.use(['table','layer','form'],function(){
    var table=layui.table
    ,layer=layui.layer
    ,form=layui.form;
    /* 获取当前用户currentUser和新增物资的权限authorExecu
    *将申领用户的信息存放到localStorage中
    */
    let currentUser=JSON.parse(sessionStorage.loginUser);
    let authorExecu=(currentUser.limits===3 && currentUser.isLeader);
    if(!localStorage.applyUserInfo){
        let applyUserArr=[];
        localStorage.applyUserInfo=JSON.stringify(applyUserArr);
    }
    // 创建申领用户ApplyUserObj构造函数，实例化申领用户对象
    function ApplyUserObj(){
        this.date='';
        this.id='';
        this.name='';
        this.applyNum=0;
        this.username='';
        this.userPhone='';
        this.remark='';
    }
    // 渲染物资表格
    table.render({
        elem: '#goodsSheet'
        ,cols: [[
            {field:'id',title:'物资编号', width:120, fixed: 'left', sort: true}
            ,{field:'name', title:'物资名称', width:100}
            ,{field:'rest', title:'库存', width:120}
            ,{field:'addNew', title:'累计新增', width:120}
            ,{title:'状态', width:80,align:'center',toolbar:'#stateTpl'}
            ,{fixed: 'right', align:'center', toolbar: '#barDemo'} 
        ]]
        ,page: true
        ,limit:5
        ,limits:[5,10,15]
        ,data:JSON.parse(localStorage.goodsInfo)
        ,id:'goodsSheet'
    });
    // 渲染申领用户信息表格
    table.render({
        elem: '#applySheet'
        ,cols: [[
            {field:'id',title:'物资编号', width:120, fixed: 'left', sort: true}
            ,{field:'name', title:'物资名称', width:100}
            ,{field:'applyNum', title:'申领数量', width:90}
            ,{field:'username', title:'申领人', width:90}
            ,{field:'userPhone', title:'联系方式', width:120} 
            ,{field:'date', title:'申领时间', width:100} 
            ,{field:'remark', title:'备注',align:'center'} 
        ]]
        ,page: true
        ,limit:5
        ,limits:[5,10,15]
        ,data:JSON.parse(localStorage.applyUserInfo)
        ,id:'applySheet'
        ,loading:false
        ,height:200
    });
    // 监听物资表格的“申领物资”工具条
    table.on('tool(goodsSheet)',function(obj){
        let data=obj.data;//获取当前行数据
        $("#edit-wrap").show();
        form.on('submit(confirmBtn)',function(formInfo){
            // 获取用户申领的时间
            let time=new Date();
            let dateStr=time.getFullYear()+'/'+(time.getMonth()+1)+'/'+time.getDate()
                        +'/'+time.getHours()+':'+time.getMinutes();
            // 更新申领用户信息
            let applyUserArr=JSON.parse(localStorage.applyUserInfo);
            let applyUser=new ApplyUserObj();
            applyUser.date=dateStr;
            applyUser.id=data.id;
            applyUser.name=data.name;
            applyUser.applyNum=formInfo.field.applyNum;
            // 同时更新物资表格的剩余数量
            data.rest=data.rest-formInfo.field.applyNum;
            applyUser.username=currentUser.username;
            applyUser.userPhone=currentUser.userPhone;
            applyUser.remark=formInfo.field.remark;
            applyUserArr.push(applyUser);
            localStorage.applyUserInfo=JSON.stringify(applyUserArr);
            table.reload('applySheet',{
                page:{curr:1},
                data:JSON.parse(localStorage.applyUserInfo)
            });
            // 更新goodsInfo的本地存储并且重载物资表格
            let goodsArr=JSON.parse(localStorage.goodsInfo);
            goodsArr.some(function(elem,index){
                if(data.id===elem.id){
                    goodsArr.splice(index,1,data);
                    localStorage.goodsInfo=JSON.stringify(goodsArr);
                    return true;
                }else{
                    return false;
                }
            });
            table.reload('goodsSheet',{
                page:{curr:1},
                data:JSON.parse(localStorage.goodsInfo)
            });
            // 关闭弹出层
            $("#edit-wrap").hide();
        });
        // 做申领表单的申领数量验证，申领数量不能大于剩余个数
        form.verify({
            'data-nums':function(value){
                if(value>data.rest){
                    return '申领数量不能大于库存';
                }
            }
        });
        // 监听“取消申领”按钮
        $("#cancelBtn").click(function(){
            $("#edit-wrap").hide();
        });
    });
    // 监听“添加”按钮,只有后勤部领导才可以新增物资
    $(".main .add").click(function(){
        if(authorExecu){
            $("#add-wrap").show();
            // 监听form表单的提交按钮
            form.on('submit(addBtn)',function(formInfo){
                // 构造一个物资的对象
                function GoodsObj(){
                    this.id='';
                    this.name='';
                    this.rest=0;
                    this.addNew=0;
                }
                let goodsArr=JSON.parse(localStorage.goodsInfo);
                let isExist=goodsArr.some(function(elem,index){
                    if(formInfo.field.id===elem.id){
                        // 如果新增的是存在的物资
                        goodsArr[index].addNew+=Number(formInfo.field.rest);
                        goodsArr[index].rest+=Number(formInfo.field.rest);
                        localStorage.goodsInfo=JSON.stringify(goodsArr);
                        table.reload('goodsSheet',{
                            page:{curr:1},
                            data:JSON.parse(localStorage.goodsInfo)
                        });
                        return true;
                    }else{
                        return false;
                    }
                });
                if(!isExist){
                    // 如果新增的是不存在的物资
                    let goods=new GoodsObj();
                    goods.id=formInfo.field.id;
                    goods.name=formInfo.field.name;
                    goods.rest=formInfo.field.rest;
                    goodsArr.push(goods);
                    localStorage.goodsInfo=JSON.stringify(goodsArr);
                    table.reload('goodsSheet',{
                        page:{curr:1},
                        data:JSON.parse(localStorage.goodsInfo)
                    });
                }
                $("#add-wrap").hide();
            });
        }else{
            layer.alert("你无权添加物资",{icon:2});
        }
    });
    // 监听取消按钮
    $("#quitBtn").click(function(){
        $("#add-wrap").hide();
    });
});