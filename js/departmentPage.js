/* departmentInfo中的limits具有唯一性
*   删除功能：
*       a.在“职工管理表”中删除一位员工需要同步更新departmentInfo
*       b.人数不为0不能删除该部门
        c.暂不考虑校长转让职位删除自己
*   新增功能：
*       a.只能选择从现有员工并且不是领导中担任新增部门领导
*       b.要验证新增领导人的姓名跟手机号想匹配
*       c.新增一个部门同时赋予权限值limits
*       d.新增一个部门同时在"注册页面"和“修改职工信息”动态添加部门的下拉菜单项
*   修改功能：
*       a.“职工管理表”领导员工的修改和“部门管理”表领导的修改双向数据绑定        
*       b.“部门管理表”中只能修改领导人，用layui的单元格编辑事件
*/
layui.use(['table','layer','form'],function(){
    var table=layui.table
    ,layer=layui.layer
    ,form=layui.form;
    let currentUser=JSON.parse(sessionStorage.loginUser);
    table.render({
        elem:'#departmentSheet',
        cols:[[
            {title:'序号',width:50,sort:true,type:'numbers'}
           ,{field:'name',title:'部门名称',width:120}
           ,{field:'leader',title:'部门领导',width:120,align:'center',toolbar:'#leaderTpl'}
           ,{field:'nums',title:'部门人数',width:120}
           ,{field:'description',title:'部门描述'}
           ,{fixed:'right',align:'center',width:70,toolbar:'#barDemo'}
        ]],
        page:true,
        limit:5,
        limits:[5,10,15],
        data:JSON.parse(localStorage.departmentInfo),
        id:'departmentSheet'
    });
    // 监听“删除”按钮
    table.on('tool(departmentSheet)',function(obj){
        if(currentUser.isPresident){
            let data=obj.data;
            let tr=obj.tr;
            if(data.nums===0){
                $(tr[0]).remove();
                let departmentArr=JSON.parse(localStorage.departmentInfo);
                departmentArr.some(function(elem,obj){
                    if(data.limits===elem.limits){
                        departmentArr.splice(index,1);
                        localStorage.departmentInfo=JSON.stringify(departmentArr);
                        table.reload('departmentSheet',{
                            page:{curr:1},
                            data:JSON.parse(localStorage.departmentInfo)
                        });
                    }
                });
            }else{
                layer.alert("人数为0时才能删除部门",{icon:7});
            }
        }else{
            layer.alert("只有校长才有权限",{icon:5});
        }
    });
});