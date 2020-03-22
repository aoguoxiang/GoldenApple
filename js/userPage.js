/* 先从sessionStorag取出loginUser存放到临时变量currentUser，避免每次用JSON方法转换数据格式
*  authorExecu判断该登陆用户是否有权限修改该页数据
* 每当修改某个员工的信息或删除时，把被操作的员工信息用于更新departmentInfo
*/

layui.use(['table','laytpl','form'], function(){
    var table = layui.table
    ,laytpl=layui.laytpl
    ,form=layui.form;
    // 获取当前登陆用户currentUser和操作权限authorExecu以及departmentInfo
    let currentUser=JSON.parse(sessionStorage.loginUser);
    let authorExecu=(currentUser.limits === 1 && currentUser.isLeader) || currentUser.isPresident;
    // 封装删除用户时更新departmentInfo
    function updateRemove(data){
        let departmentArr=JSON.parse(localStorage.departmentInfo);
        departmentArr.some(function(elem,index){
            if(data.limits===elem.limits){
                departmentArr[index].nums--;
                if(!data.isLeader){
                    // 删除普通员工
                    localStorage.departmentInfo=JSON.stringify(departmentArr);
                    return true;
                }else{
                    // 上传领导
                    departmentArr[index].leader='';
                    departmentArr[index].leaderPhone='';
                    localStorage.departmentInfo=JSON.stringify(departmentArr);
                    return true;
                }
            }else{
                return false;
            }
        });
    }
    // 表格数据渲染
    table.render({
        elem: '#usersheet'
        ,toolbar: true
        ,title: '用户数据表'
        ,cols: [[
            {field:'id',title:'序号', width:80, fixed: 'left', type:'numbers', sort: true}
            ,{field:'username', title:'姓名', width:100}
            ,{field:'userPhone', title:'联系方式', width:120}
            ,{field:'sex', title:'性别', width:80, sort: true}
            ,{field:'department', title:'部门', width:90}
            ,{field:'duty', title:'职务', width:100}
            ,{field:'sign', title:'个性签名',width:150}
            ,{fixed: 'right', align:'center', toolbar: '#barDemo'} 
        ]]
        ,page: true
        ,limit:5
        ,limits:[5,10,15]
        ,data:JSON.parse(localStorage.userInfo)
        ,id:'usersheet'
    });
    //监听工具条 
    table.on('tool(usersheet)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        var tr = obj.tr; //获得当前行 tr 的 DOM 对象（如果有的话）
        
        if(layEvent === 'detail'){
            // 所有职工都可以查看
            let getTpl = template.innerHTML
            ,view=document.getElementById("view");
            laytpl(getTpl).render(data, function(html){
                view.innerHTML = html;
                $("#view-wrap").show();
                $("#closeBtn").click(function(){
                    $("#view-wrap").hide();
                });
            });
        } else if(layEvent === 'del'){
            // 仅当是园长或行政部的领导才可以删除数据
            if(authorExecu){
                if(!currentUser.isPresident){
                    // 行政部领导
                    if(!data.isLeader){
                        layer.confirm('真的要删除该职工', function(i){
                            $(tr).remove();
                            let userInfoArr=JSON.parse(localStorage.userInfo);
                            // 删除的是普通的员工，只需更新相应部门的人数
                            updateRemove(data);
                            userInfoArr.some(function(elem,index){
                                if(elem.userPhone === data.userPhone){
                                    userInfoArr.splice(index,1);
                                    localStorage.userInfo=JSON.stringify(userInfoArr);
                                    return true;
                                }else{
                                    return false;
                                }
                            });
                            layer.close(i);
                            // 数据重载
                            table.reload('usersheet',{
                                page:{curr:1}
                                ,data:JSON.parse(localStorage.userInfo)
                            });
                        });
                    }else{
                        layer.alert("只有校长才能删除领导",{icon:2});
                    }
                }else{
                    // 园长所有职工都能删除(除了自己)
                    if(currentUser.userPhone === data.userPhone){
                        layer.alert("一个学校怎能没有校长，你把职位转让后再离开吧！",{icon:6});
                    }else{
                        layer.confirm('真的要删除该职工', function(i){
                            $(tr).remove();
                            let userInfoArr=JSON.parse(localStorage.userInfo);
                            updateRemove(data);
                            userInfoArr.some(function(elem,index){
                                if(elem.userPhone === data.userPhone){
                                    userInfoArr.splice(index,1);
                                    localStorage.userInfo=JSON.stringify(userInfoArr);
                                    return true;
                                }else{
                                    return false;
                                }
                            });
                            // 数据重载
                            table.reload('usersheet',{
                                page:{curr:1}
                                ,data:JSON.parse(localStorage.userInfo)
                            });
                            layer.close(i);
                        });
                    }
                }
            }else{
                layer.alert("你无权限执行该操作",{icon:2});
            }
        } else if(layEvent === 'edit'){
            // 只有园长和领导才可以编辑
            if(authorExecu){
                if(!currentUser.isPresident && data.isPresident){
                    layer.alert("无权限修改校长信息",{icon:2});
                }else{
                    $("#edit-wrap").show();
                }
            }else{
                layer.alert("你无权限执行此操作",{icon:2});
            }
            // 监听职工信息编辑框的“确认修改”按钮
            form.on('submit(confirmBtn)',function(formInfo){
                console.log(formInfo.field);
                let userInfoArr=JSON.parse(localStorage.userInfo);
                data.username=formInfo.field.username;
                data.limits=formInfo.field.limits;
                data.department=$("select[name=limits] option").filter(":selected").text();
                data.duty=formInfo.field.duty;
                data.sign=formInfo.field.sign;
                console.log(data);
                userInfoArr.some((elem,index)=>{
                    if(data.userPhone===elem.userPhone){
                        userInfoArr.splice(index,1,data);
                        localStorage.userInfo=JSON.stringify(userInfoArr);
                        table.reload('usersheet',{
                            page:{curr:1}
                            ,data:JSON.parse(localStorage.userInfo)
                        });
                    }
                });
                $("#edit-wrap").hide();
            });
            form.verify({
                "data-username": function(value, item){ //value：表单的值、item：表单的DOM对象
                    if(!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)){
                        return '用户名不能有特殊字符';
                    }
                    if(/(^\_)|(\__)|(\_+$)/.test(value)){
                        return '用户名首尾不能出现下划线\'_\'';
                    }
                    if(/^\d+\d+\d$/.test(value)){
                        return '用户名不能全为数字';
                    }
                }
            });
            // 监听“取消修改”按钮
            $("#cancelBtn").click(function(){
                $("#edit-wrap").hide();
            });
        } 
    });
});